import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true }
});

const flashcardSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
});

const quizAttemptSchema = new mongoose.Schema({
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now }
});

const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  extractedText: {
    type: String,
    required: true
  },
  summary: [{
    type: String
  }],
  quizzes: [quizSchema],
  flashcards: [flashcardSchema],
  isFavorite: {
    type: Boolean,
    default: false
  },
  quizAttempts: [quizAttemptSchema]
}, {
  timestamps: true
});

const Note = mongoose.model('Note', noteSchema);
export default Note;
