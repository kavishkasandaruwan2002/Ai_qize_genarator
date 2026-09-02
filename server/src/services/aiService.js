import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

// Helper to clean and parse JSON from AI response
const parseJSONResponse = (text) => {
  let cleanText = text.trim();

  try {
    // 1. Try standard JSON.parse first
    return JSON.parse(cleanText);
  } catch (initialError) {
    console.warn('Standard JSON.parse failed, attempting robust parsing/cleanup...');

    // 2. Remove markdown code block wrappers anywhere in the string
    cleanText = cleanText.replace(/```(?:json)?\n([\s\S]*?)\n```/gi, '$1').trim();
    cleanText = cleanText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '').trim();

    // 3. Extract JSON object or array bounds (ignore any text before/after)
    const firstBrace = cleanText.indexOf('{');
    const firstBracket = cleanText.indexOf('[');

    let startIdx = -1;
    let endIdx = -1;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      startIdx = firstBrace;
      endIdx = cleanText.lastIndexOf('}');
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
      endIdx = cleanText.lastIndexOf(']');
    }

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      cleanText = cleanText.slice(startIdx, endIdx + 1);
    }

    // 4. Try parsing after boundary extraction
    try {
      return JSON.parse(cleanText);
    } catch (boundaryError) {
      // 5. Fix trailing commas before closing braces/brackets: e.g. [1, 2, ] -> [1, 2]
      cleanText = cleanText.replace(/,(\s*[\]}])/g, '$1');

      // 6. Replace unescaped control characters/newlines/tabs inside string values
      cleanText = cleanText.replace(/[\n\r\t]/g, ' ');

      try {
        return JSON.parse(cleanText);
      } catch (finalError) {
        console.error('Failed to parse JSON response. Raw text was:', text);
        throw new Error('AI response was not in valid JSON format: ' + finalError.message);
      }
    }
  }
};

// Helper to extract an array from a JSON object if it's wrapped or nested
const extractArrayFromJSON = (parsed, errorMessage, type = 'any') => {
  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (parsed && typeof parsed === 'object') {
    // 1. Look for any property that is an array
    for (const key of Object.keys(parsed)) {
      if (Array.isArray(parsed[key])) {
        return parsed[key];
      }
    }

    // 2. If it's a single item of the expected type, wrap it in an array
    if (type === 'mcq' && parsed.question && Array.isArray(parsed.options)) {
      return [parsed];
    }
    if (type === 'flashcard' && (parsed.question || parsed.term) && (parsed.answer || parsed.definition)) {
      return [{
        question: parsed.question || parsed.term,
        answer: parsed.answer || parsed.definition
      }];
    }

    // 3. For flashcards, check if it's a simple key-value dictionary: { "term": "definition" }
    if (type === 'flashcard') {
      const entries = Object.entries(parsed);
      if (entries.length > 0 && entries.every(([k, v]) => typeof v === 'string')) {
        return entries.map(([key, val]) => ({
          question: key,
          answer: val
        }));
      }
    }

    // 4. If it's an object with objects as values, convert values to array
    const values = Object.values(parsed);
    if (values.length > 0 && values.every(val => typeof val === 'object' && val !== null)) {
      if (type === 'flashcard') {
        return values.map(item => ({
          question: item.question || item.term || '',
          answer: item.answer || item.definition || ''
        }));
      }
      return values;
    }
  }
  throw new Error(errorMessage);
};

// Helper to clean bullet points from summary text
const parseSummaryText = (text) => {
  if (!text || typeof text !== 'string') return [];

  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('-') || line.startsWith('*') || line.startsWith('•'))
    .map(line => line.replace(/^[-*•]\s*/, '').trim())
    .filter(line => {
      if (line.length === 0) return false;
      // Filter out lines that are just dashes, asterisks, or underscores (dividers/remnants)
      if (/^[\\*•_*#\s-]+$/.test(line)) return false;
      return true;
    });
};

// Heals incomplete JSON (missing closing braces/brackets)
const healJSON = (str) => {
  let clean = str.trim();
  
  // Count open and close braces/brackets
  let openBraces = (clean.match(/\{/g) || []).length;
  let closeBraces = (clean.match(/\}/g) || []).length;
  let openBrackets = (clean.match(/\[/g) || []).length;
  let closeBrackets = (clean.match(/\]/g) || []).length;

  while (openBraces > closeBraces) {
    clean += '}';
    closeBraces++;
  }
  while (openBrackets > closeBrackets) {
    clean += ']';
    closeBrackets++;
  }

  return clean;
};

// Robustly extracts MCQ quizzes via regex if JSON parsing fails
const extractQuizzesByRegex = (text) => {
  const quizzes = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  let currentQuestion = null;
  let currentOptions = [];
  let currentAnswer = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const questionMatch = line.match(/^(?:\d+[\.\)]|question:)\s*(.*)/i) || line.match(/"question"\s*:\s*"([^"]+)"/i);
    const optionMatch = line.match(/^(?:[A-D][\.\)]|options:)\s*(.*)/i) || line.match(/"(?:options|choices)"\s*:\s*\[([^\]]+)\]/i);
    const answerMatch = line.match(/^(?:correctAnswer|correct_answer|correct|answer|ans):\s*(.*)/i) || line.match(/"(?:correctAnswer|correct_answer|correct|answer)"\s*:\s*"([^"]+)"/i);

    if (questionMatch) {
      if (currentQuestion && currentOptions.length >= 2) {
        quizzes.push({
          question: currentQuestion,
          options: currentOptions,
          correctAnswer: currentAnswer || currentOptions[0]
        });
      }
      currentQuestion = questionMatch[1].replace(/^["']|["']$/g, '').trim();
      currentOptions = [];
      currentAnswer = '';
    } else if (optionMatch) {
      if (line.includes('[')) {
        const optsText = optionMatch[1];
        const parsedOpts = optsText.split(',').map(o => o.replace(/^["']|["']$/g, '').trim());
        currentOptions.push(...parsedOpts);
      } else {
        currentOptions.push(optionMatch[1].replace(/^["']|["']$/g, '').trim());
      }
    } else if (answerMatch) {
      currentAnswer = answerMatch[1].replace(/^["']|["']$/g, '').trim();
    } else {
      const bulletOptionMatch = line.match(/^[-*•]\s*(.*)/) || line.match(/^[A-D]\)\s*(.*)/i);
      if (bulletOptionMatch && currentQuestion && currentOptions.length < 4) {
        currentOptions.push(bulletOptionMatch[1].trim());
      }
    }
  }

  if (currentQuestion && currentOptions.length >= 2) {
    quizzes.push({
      question: currentQuestion,
      options: currentOptions,
      correctAnswer: currentAnswer || currentOptions[0]
    });
  }

  return quizzes;
};

// Enforces types, key mapping, and option paddings to pass Mongoose validation rules
const normalizeQuizzes = (quizzes) => {
  if (!Array.isArray(quizzes)) return [];
  
  return quizzes.map(q => {
    const question = q.question || q.text || q.q || '';
    
    let options = q.options || q.choices || q.answers || [];
    if (!Array.isArray(options) && typeof options === 'object' && options !== null) {
      options = Object.values(options);
    }
    if (!Array.isArray(options)) {
      options = [];
    }
    
    options = options.map(opt => String(opt).trim());
    if (options.length === 0) {
      options = ['Option A', 'Option B', 'Option C', 'Option D'];
    }
    while (options.length < 4) {
      options.push(`Option ${String.fromCharCode(65 + options.length)}`);
    }

    let correctAnswer = q.correctAnswer || q.correct_answer || q.correct || q.answer || q.correctOption || q.ans || '';
    correctAnswer = String(correctAnswer).trim();

    if (!correctAnswer) {
      correctAnswer = options[0];
    } else if (!options.includes(correctAnswer)) {
      const indexMap = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, 'a.': 0, 'b.': 1, 'c.': 2, 'd.': 3 };
      const cleanKey = correctAnswer.toLowerCase().trim();
      if (indexMap[cleanKey] !== undefined && options[indexMap[cleanKey]]) {
        correctAnswer = options[indexMap[cleanKey]];
      } else if (!isNaN(cleanKey) && options[parseInt(cleanKey)]) {
        correctAnswer = options[parseInt(cleanKey)];
      } else {
        if (options.length < 4) {
          options.push(correctAnswer);
        } else {
          correctAnswer = options[0];
        }
      }
    }

    return {
      question: String(question).trim(),
      options: options.slice(0, 4),
      correctAnswer
    };
  }).filter(q => q.question && q.options.length >= 2);
};

// Robustly extracts flashcards via regex if JSON parsing fails
const extractFlashcardsByRegex = (text) => {
  const flashcards = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  let currentQuestion = '';
  let currentAnswer = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const qMatch = line.match(/^(?:Q|Question|Term|Front):\s*(.*)/i) || line.match(/"question"\s*:\s*"([^"]+)"/i);
    const aMatch = line.match(/^(?:A|Answer|Definition|Back):\s*(.*)/i) || line.match(/"answer"\s*:\s*"([^"]+)"/i);

    if (qMatch) {
      if (currentQuestion && currentAnswer) {
        flashcards.push({ question: currentQuestion, answer: currentAnswer });
      }
      currentQuestion = qMatch[1].replace(/^["']|["']$/g, '').trim();
      currentAnswer = '';
    } else if (aMatch) {
      currentAnswer = aMatch[1].replace(/^["']|["']$/g, '').trim();
    }
  }

  if (currentQuestion && currentAnswer) {
    flashcards.push({ question: currentQuestion, answer: currentAnswer });
  }

  return flashcards;
};

// Enforces valid shape for Mongoose flashcard validation
const normalizeFlashcards = (flashcards) => {
  if (!Array.isArray(flashcards)) return [];
  
  return flashcards.map(f => {
    const question = f.question || f.term || f.front || f.q || '';
    const answer = f.answer || f.definition || f.back || f.a || '';
    return {
      question: String(question).trim(),
      answer: String(answer).trim()
    };
  }).filter(f => f.question && f.answer);
};

// Safe wrapper for parsing quizzes
export const safeParseQuizzes = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  let parsed = null;
  
  try {
    parsed = parseJSONResponse(text);
  } catch (err) {
    console.warn("Initial JSON parse failed. Trying to heal JSON...", err.message);
    try {
      const healed = healJSON(text);
      parsed = parseJSONResponse(healed);
    } catch (healErr) {
      console.warn("JSON healing failed. Falling back to Regex extraction...", healErr.message);
    }
  }

  let quizzes = [];
  if (parsed) {
    try {
      quizzes = extractArrayFromJSON(parsed, 'Not an array', 'mcq');
    } catch (arrErr) {
      console.warn("Could not extract array from parsed JSON. Using regex fallback.", arrErr.message);
    }
  }

  if (!quizzes || quizzes.length === 0) {
    quizzes = extractQuizzesByRegex(text);
  }

  return normalizeQuizzes(quizzes);
};

// Safe wrapper for parsing flashcards
export const safeParseFlashcards = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  let parsed = null;
  try {
    parsed = parseJSONResponse(text);
  } catch (err) {
    try {
      parsed = parseJSONResponse(healJSON(text));
    } catch (e) {}
  }

  let flashcards = [];
  if (parsed) {
    try {
      flashcards = extractArrayFromJSON(parsed, 'Not an array', 'flashcard');
    } catch (e) {}
  }

  if (!flashcards || flashcards.length === 0) {
    flashcards = extractFlashcardsByRegex(text);
  }

  return normalizeFlashcards(flashcards);
};

// Helper to validate the Gemini API key
const validateGeminiKey = (key) => {
  if (!key || typeof key !== 'string' || key.trim().length === 0) {
    throw new Error('Gemini API key is empty or invalid.');
  }
  if (key.trim().startsWith('AQ.')) {
    console.warn(
      'Notice: GEMINI_API_KEY starts with "AQ." (Google Cloud key). ' +
      'Ensure the "Generative Language API" is enabled in your Google Cloud Project: ' +
      'https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com'
    );
  }
};

/**
 * Generates study materials from extracted text.
 * @param {string} text - The study notes text
 * @returns {Promise<{summary: string[], quizzes: object[], flashcards: object[]}>}
 */
export const generateStudyMaterials = async (text) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openaiKey) {
    throw new Error('No AI API keys found. Please set GEMINI_API_KEY or OPENAI_API_KEY in your .env file.');
  }

  // Define prompts
  const summaryPrompt = `Summarize the following study notes into simple bullet points for exam revision: ${text}`;

  const mcqPrompt = `Generate 10 multiple choice questions with 4 options each and correct answers based on this content: ${text}
  
  You MUST return the output as a valid JSON array of objects. Do NOT include any markdown block formatting (like \`\`\`json) or other text.
  Each object in the array must have this structure:
  {
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "The exact string of the correct option"
  }`;

  const flashcardPrompt = `Convert this content into flashcards in Q&A format: ${text}
  
  You MUST return the output as a valid JSON array of objects. Do NOT include any markdown block formatting (like \`\`\`json) or other text.
  Each object in the array must have this structure:
  {
    "question": "The question or term",
    "answer": "The answer or definition"
  }`;

  // 1. Try Google Gemini API (using the new @google/genai SDK)
  if (geminiKey) {
    console.log('Using Google Gemini API (gemini-2.0-flash) for study material generation...');

    try {
      validateGeminiKey(geminiKey);

      const genAI = new GoogleGenAI({ apiKey: geminiKey });

      // Run calls in parallel
      const [summaryRes, mcqRes, flashcardRes] = await Promise.all([
        genAI.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: summaryPrompt
        }),
        genAI.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: mcqPrompt,
          config: { responseMimeType: 'application/json' }
        }),
        genAI.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: flashcardPrompt,
          config: { responseMimeType: 'application/json' }
        })
      ]);

      const summaryText = summaryRes.text;
      const mcqText = mcqRes.text;
      const flashcardText = flashcardRes.text;

      const summary = parseSummaryText(summaryText);
      const quizzes = safeParseQuizzes(mcqText);
      const flashcards = safeParseFlashcards(flashcardText);

      return { summary, quizzes, flashcards };
    } catch (error) {
      console.error('Gemini API Error:', error);
      if (openaiKey) {
        console.warn('Gemini API failed. Falling back to OpenAI...');
      } else {
        throw new Error('Gemini API generation failed: ' + error.message);
      }
    }
  }

  // 2. Fallback to OpenAI or OpenRouter API
  if (openaiKey) {
    const isOpenRouter = openaiKey.startsWith('sk-or-');
    const baseURL = isOpenRouter ? 'https://openrouter.ai/api/v1' : undefined;
    const model = isOpenRouter
      ? (process.env.OpenRout_model || process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free')
      : 'gpt-4o-mini';

    console.log(`Using ${isOpenRouter ? 'OpenRouter' : 'OpenAI'} API (${model}) for study material generation...`);

    const clientOptions = { apiKey: openaiKey };
    if (baseURL) {
      clientOptions.baseURL = baseURL;
      clientOptions.defaultHeaders = {
        'HTTP-Referer': 'http://localhost:5000',
        'X-Title': 'AI Study Assistant'
      };
    }

    const openai = new OpenAI(clientOptions);

    try {
      // Run calls in parallel
      const [summaryRes, mcqRes, flashcardRes] = await Promise.all([
        openai.chat.completions.create({
          model: model,
          messages: [{ role: 'user', content: summaryPrompt }]
        }),
        openai.chat.completions.create({
          model: model,
          messages: [{ role: 'user', content: mcqPrompt }]
        }),
        openai.chat.completions.create({
          model: model,
          messages: [{ role: 'user', content: flashcardPrompt }]
        })
      ]);

      const summaryText = summaryRes.choices[0].message.content;
      const mcqText = mcqRes.choices[0].message.content;
      const flashcardText = flashcardRes.choices[0].message.content;

      const summary = parseSummaryText(summaryText);
      const quizzes = safeParseQuizzes(mcqText);
      const flashcards = safeParseFlashcards(flashcardText);

      return { summary, quizzes, flashcards };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('OpenAI API generation failed: ' + error.message);
    }
  }
};

/**
 * Generates only MCQ quizzes from extracted text.
 * @param {string} text - The study notes text
 * @returns {Promise<object[]>}
 */
export const generateQuizzes = async (text) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openaiKey) {
    throw new Error('No AI API keys found. Please set GEMINI_API_KEY or OPENAI_API_KEY in your .env file.');
  }

  const mcqPrompt = `Generate 10 multiple choice questions with 4 options each and correct answers based on this content: ${text}
  
  You MUST return the output as a valid JSON array of objects. Do NOT include any markdown block formatting (like \`\`\`json) or other text.
  Each object in the array must have this structure:
  {
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "The exact string of the correct option"
  }`;

  if (geminiKey) {
    console.log('Using Google Gemini API (gemini-2.0-flash) for quiz generation...');
    try {
      validateGeminiKey(geminiKey);
      const genAI = new GoogleGenAI({ apiKey: geminiKey });
      const mcqRes = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: mcqPrompt,
        config: { responseMimeType: 'application/json' }
      });
      return safeParseQuizzes(mcqRes.text);
    } catch (error) {
      console.error('Gemini Quiz API Error:', error);
      if (openaiKey) {
        console.warn('Gemini API failed. Falling back to OpenAI...');
      } else {
        throw new Error('Gemini API quiz generation failed: ' + error.message);
      }
    }
  }

  if (openaiKey) {
    const isOpenRouter = openaiKey.startsWith('sk-or-');
    const baseURL = isOpenRouter ? 'https://openrouter.ai/api/v1' : undefined;
    const model = isOpenRouter
      ? (process.env.OpenRout_model || process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free')
      : 'gpt-4o-mini';

    console.log(`Using ${isOpenRouter ? 'OpenRouter' : 'OpenAI'} API (${model}) for quiz generation...`);
    const clientOptions = { apiKey: openaiKey };
    if (baseURL) {
      clientOptions.baseURL = baseURL;
      clientOptions.defaultHeaders = {
        'HTTP-Referer': 'http://localhost:5000',
        'X-Title': 'AI Study Assistant'
      };
    }

    const openai = new OpenAI(clientOptions);
    try {
      const mcqRes = await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: mcqPrompt }]
      });
      return safeParseQuizzes(mcqRes.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI Quiz API Error:', error);
      throw new Error('OpenAI API quiz generation failed: ' + error.message);
    }
  }
};
