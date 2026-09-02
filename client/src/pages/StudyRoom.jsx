import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getNoteById, toggleFavorite } from '../services/note';
import SummaryView from '../components/SummaryView';
import MCQQuiz from '../components/MCQQuiz';
import FlashcardView from '../components/FlashcardView';
import { 
  ArrowLeft, 
  Sparkles, 
  FileText, 
  HelpCircle, 
  Layers, 
  Star,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StudyRoom = () => {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'quiz', 'flashcards'
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNoteDetails = async () => {
      try {
        const data = await getNoteById(id);
        setNote(data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load study room.');
      } finally {
        setLoading(false);
      }
    };

    fetchNoteDetails();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!note) return;
    try {
      const result = await toggleFavorite(note._id);
      setNote(prev => ({ ...prev, isFavorite: result.isFavorite }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-10" />
        </div>

        {/* Tab Navigation Skeleton */}
        <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-xl w-full max-w-md" />

        {/* Content Skeleton */}
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-red-500 mb-2">Error Loading Study Room</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{error || 'Note not found.'}</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl"
        >
          <ArrowLeft size={16} />
          Back to Library
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'summary', name: 'Summary', icon: FileText },
    { id: 'quiz', name: 'MCQ Quiz', icon: HelpCircle },
    { id: 'flashcards', name: 'Flashcards', icon: Layers },
  ];

  return (
    <div className="space-y-8">
      
      {/* Back Button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 line-clamp-1">
              {note.title}
            </h2>
            <span className="text-xs text-slate-400 font-medium">Study Room</span>
          </div>
        </div>

        <button
          onClick={handleToggleFavorite}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
            note.isFavorite
              ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Star size={16} fill={note.isFavorite ? 'currentColor' : 'none'} />
          <span>{note.isFavorite ? 'Bookmarked' : 'Bookmark'}</span>
        </button>
      </div>

      {/* Tab Navigation Menu */}
      <div className="flex border-b border-slate-200 dark:border-slate-800/50">
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <Icon size={16} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Panels */}
      <div className="min-h-[350px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'summary' && (
              <SummaryView summary={note.summary} title={note.title} />
            )}
            {activeTab === 'quiz' && (
              <MCQQuiz 
                quizzes={note.quizzes} 
                noteId={note._id} 
                onQuizzesGenerated={(newQuizzes) => {
                  setNote(prev => ({ ...prev, quizzes: newQuizzes }));
                }}
              />
            )}
            {activeTab === 'flashcards' && (
              <FlashcardView flashcards={note.flashcards} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
};

export default StudyRoom;
