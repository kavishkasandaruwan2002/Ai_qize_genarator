import express from 'express';
import { 
  uploadNote, 
  getNotes, 
  getNoteById, 
  deleteNote, 
  toggleFavorite, 
  addQuizAttempt 
} from '../controllers/notesController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Apply auth protection middleware to all note routes
router.use(protect);

// Routes
router.post('/upload', upload.single('pdf'), uploadNote);
router.get('/', getNotes);
router.get('/:id', getNoteById);
router.delete('/:id', deleteNote);
router.patch('/:id/favorite', toggleFavorite);
router.post('/:id/quiz-attempt', addQuizAttempt);

export default router;
