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
      const quizzes = extractArrayFromJSON(parseJSONResponse(mcqText), 'Gemini MCQ response is not an array.', 'mcq');
      const flashcards = extractArrayFromJSON(parseJSONResponse(flashcardText), 'Gemini Flashcards response is not an array.', 'flashcard');

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
          messages: [{ role: 'user', content: mcqPrompt }],
          response_format: { type: 'json_object' }
        }),
        openai.chat.completions.create({
          model: model,
          messages: [{ role: 'user', content: flashcardPrompt }],
          response_format: { type: 'json_object' }
        })
      ]);

      const summaryText = summaryRes.choices[0].message.content;
      const mcqText = mcqRes.choices[0].message.content;
      const flashcardText = flashcardRes.choices[0].message.content;

      const summary = parseSummaryText(summaryText);
      const quizzes = extractArrayFromJSON(parseJSONResponse(mcqText), 'OpenAI MCQ response is not an array.', 'mcq');
      const flashcards = extractArrayFromJSON(parseJSONResponse(flashcardText), 'OpenAI Flashcards response is not an array.', 'flashcard');

      return { summary, quizzes, flashcards };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('OpenAI API generation failed: ' + error.message);
    }
  }
};
