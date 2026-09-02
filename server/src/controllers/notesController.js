import Note from '../models/Note.js';
import { extractTextFromPDF } from '../services/pdfService.js';
import { generateStudyMaterials, generateQuizzes } from '../services/aiService.js';

/**
 * @desc    Upload PDF, extract text, run AI generation, and save note
 * @route   POST /api/notes/upload
 * @access  Private
 */
export const uploadNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please upload a PDF.' });
    }

    const originalName = req.file.originalname;
    console.log(`Processing uploaded file: ${originalName}`);

    // 1. Extract text from PDF
    let extractedText = '';
    try {
      extractedText = await extractTextFromPDF(req.file.buffer);
    } catch (pdfError) {
      console.error('PDF Extraction Error:', pdfError);
      return res.status(400).json({ message: 'Failed to parse PDF file. Ensure it is not corrupted or password-protected.' });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ message: 'The uploaded PDF appears to have no readable text.' });
    }

    // Trim text if it's exceptionally long to avoid API token limits (e.g. limit to first 15000 characters for safety, ~3000-4000 words)
    // Most student study notes are within this limit.
    const cleanText = extractedText.trim();
    const maxLength = 25000;
    const processingText = cleanText.length > maxLength 
      ? cleanText.substring(0, maxLength) + '\n[Note: Content truncated for AI processing]' 
      : cleanText;

    console.log(`Extracted ${cleanText.length} characters. Sending to AI service...`);

    // 2. Generate study materials via AI
    let aiOutputs;
    try {
      aiOutputs = await generateStudyMaterials(processingText);
    } catch (aiError) {
      console.error('AI Generation Error:', aiError);
      return res.status(500).json({ message: 'AI generation failed: ' + aiError.message });
    }

    // 3. Save to MongoDB
    const note = new Note({
      userId: req.user._id,
      title: originalName.replace(/\.[^/.]+$/, ''), // remove file extension
      extractedText: cleanText,
      summary: aiOutputs.summary,
      quizzes: aiOutputs.quizzes,
      flashcards: aiOutputs.flashcards
    });

    const savedNote = await note.save();
    console.log(`Successfully generated and saved note: ${savedNote.title}`);
    return res.status(201).json(savedNote);

  } catch (error) {
    console.error('Upload Note Controller Error:', error);
    return res.status(500).json({ message: 'Server error processing study note' });
  }
};

/**
 * @desc    Get all notes for authenticated user
 * @route   GET /api/notes
 * @access  Private
 */
export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id })
      .select('title isFavorite quizAttempts createdAt') // exclude heavy fields for list view
      .sort({ createdAt: -1 });
    
    return res.json(notes);
  } catch (error) {
    console.error('Get Notes Error:', error);
    return res.status(500).json({ message: 'Server error fetching notes list' });
  }
};

/**
 * @desc    Get specific note by ID
 * @route   GET /api/notes/:id
 * @access  Private
 */
export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });

    if (!note) {
      return res.status(404).json({ message: 'Study note not found' });
    }

    return res.json(note);
  } catch (error) {
    console.error('Get Note By ID Error:', error);
    return res.status(500).json({ message: 'Server error fetching note details' });
  }
};

/**
 * @desc    Delete a note
 * @route   DELETE /api/notes/:id
 * @access  Private
 */
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!note) {
      return res.status(404).json({ message: 'Study note not found' });
    }

    return res.json({ message: 'Study note deleted successfully' });
  } catch (error) {
    console.error('Delete Note Error:', error);
    return res.status(500).json({ message: 'Server error deleting note' });
  }
};

/**
 * @desc    Toggle favorite status of a note
 * @route   PATCH /api/notes/:id/favorite
 * @access  Private
 */
export const toggleFavorite = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });

    if (!note) {
      return res.status(404).json({ message: 'Study note not found' });
    }

    note.isFavorite = !note.isFavorite;
    const updatedNote = await note.save();

    return res.json({ id: updatedNote._id, isFavorite: updatedNote.isFavorite });
  } catch (error) {
    console.error('Toggle Favorite Error:', error);
    return res.status(500).json({ message: 'Server error updating favorite status' });
  }
};

/**
 * @desc    Add a quiz attempt score
 * @route   POST /api/notes/:id/quiz-attempt
 * @access  Private
 */
export const addQuizAttempt = async (req, res) => {
  const { score, totalQuestions } = req.body;

  if (score === undefined || totalQuestions === undefined) {
    return res.status(400).json({ message: 'Please provide score and totalQuestions' });
  }

  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });

    if (!note) {
      return res.status(404).json({ message: 'Study note not found' });
    }

    note.quizAttempts.push({ score, totalQuestions });
    await note.save();

    return res.json({ 
      message: 'Quiz attempt saved', 
      quizAttempts: note.quizAttempts 
    });
  } catch (error) {
    console.error('Add Quiz Attempt Error:', error);
    return res.status(500).json({ message: 'Server error saving quiz attempt' });
  }
};

/**
 * @desc    Generate MCQs/quizzes for a note if they don't exist
 * @route   POST /api/notes/:id/generate-quizzes
 * @access  Private
 */
export const generateQuizzesForNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });

    if (!note) {
      return res.status(404).json({ message: 'Study note not found' });
    }

    if (!note.extractedText || note.extractedText.trim().length === 0) {
      return res.status(400).json({ message: 'This note has no extracted text to generate MCQs from.' });
    }

    const cleanText = note.extractedText.trim();
    const maxLength = 25000;
    const processingText = cleanText.length > maxLength 
      ? cleanText.substring(0, maxLength) + '\n[Note: Content truncated for AI processing]' 
      : cleanText;

    console.log(`Generating MCQs for note "${note.title}" (${note._id})...`);
    const quizzes = await generateQuizzes(processingText);

    note.quizzes = quizzes;
    await note.save();

    console.log(`Successfully generated and saved ${quizzes.length} MCQs for note: ${note.title}`);
    return res.json({ quizzes });
  } catch (error) {
    console.error('Generate Quizzes Controller Error:', error);
    return res.status(500).json({ message: error.message || 'Server error generating MCQs' });
  }
};
