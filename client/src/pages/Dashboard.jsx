import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNotes, toggleFavorite, deleteNote } from '../services/note';
import {
  FileText,
  Star,
  Trash2,
  ArrowRight,
  UploadCloud,
  Trophy,
  BookOpen,
  Plus,
  Search,
  Calendar,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const fetchNotesList = async () => {
    try {
      const data = await getNotes();
      setNotes(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch study notes. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotesList();
  }, []);

  const handleToggleFavorite = async (id, e) => {
    e.preventDefault(); // prevent navigation
    e.stopPropagation();
    try {
      const updated = await toggleFavorite(id);
      setNotes(prev =>
        prev.map(n => n._id === id ? { ...n, isFavorite: updated.isFavorite } : n)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (id, title, e) => {
    e.preventDefault(); // prevent navigation
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await deleteNote(id);
      setNotes(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete note.');
    }
  };

  // Calculations for stats
  const totalNotes = notes.length;
  const favoriteNotes = notes.filter(n => n.isFavorite).length;

  let totalAttempts = 0;
  let scoreSum = 0;
  let questionSum = 0;

  notes.forEach(note => {
    if (note.quizAttempts && note.quizAttempts.length > 0) {
      totalAttempts += note.quizAttempts.length;
      note.quizAttempts.forEach(attempt => {
        scoreSum += attempt.score;
        questionSum += attempt.totalQuestions;
      });
    }
  });

  const avgScorePercent = questionSum > 0 ? Math.round((scoreSum / questionSum) * 100) : 0;

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">

      {/* Premium Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 text-white p-6 md:p-8 shadow-xl shadow-indigo-600/10 border border-indigo-500/20">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2.5 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide text-indigo-100 uppercase">
              <Sparkles size={12} className="animate-pulse-slow" /> AI Study Engine Active
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
              Transform your notes with AI
            </h2>
            <p className="text-indigo-100/90 text-sm md:text-base leading-relaxed font-medium">
              Upload your lecture slides or study materials as PDFs. We'll instantly extract key concepts, create revision summaries, draft MCQ quizzes, and build flippable flashcard decks.
            </p>
          </div>
          <Link
            to="/upload"
            className="flex items-center gap-2.5 bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-sm px-6 py-3.5 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-100 transition-all shrink-0 cursor-pointer"
          >
            <Plus size={18} strokeWidth={2.5} />
            Upload PDF Notes
          </Link>
        </div>

        {/* Decorative background gradients */}
        <div className="absolute right-[-5%] top-[-20%] w-72 h-72 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute left-[10%] bottom-[-50%] w-80 h-80 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Decks */}
        <div className="glass-card p-6 rounded-2xl flex items-center gap-5 border border-slate-200/50 dark:border-slate-800/40">
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Notes</p>
            <h3 className="text-2xl font-black mt-0.5">{totalNotes}</h3>
          </div>
        </div>

        {/* Favorites */}
        <div className="glass-card p-6 rounded-2xl flex items-center gap-5 border border-slate-200/50 dark:border-slate-800/40">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-2xl">
            <Star size={24} fill="currentColor" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Favorites</p>
            <h3 className="text-2xl font-black mt-0.5">{favoriteNotes}</h3>
          </div>
        </div>

        {/* Quiz Attempts */}
        <div className="glass-card p-6 rounded-2xl flex items-center gap-5 border border-slate-200/50 dark:border-slate-800/40">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Quiz Runs</p>
            <h3 className="text-2xl font-black mt-0.5">{totalAttempts}</h3>
          </div>
        </div>

        {/* Avg Quiz Score */}
        <div className="glass-card p-6 rounded-2xl flex items-center gap-5 border border-slate-200/50 dark:border-slate-800/40">
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-2xl">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Avg Score</p>
            <h3 className="text-2xl font-black mt-0.5">
              {totalAttempts > 0 ? `${avgScorePercent}%` : '—'}
            </h3>
          </div>
        </div>
      </div>

      {/* Search and List Controls */}
      <div className="flex items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search study notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 glass-input text-sm text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Notes List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-card h-48 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
              </div>
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : filteredNotes.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.div
                key={note._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/50 dark:hover:border-indigo-400/50 group"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {note.title}
                    </h3>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={(e) => handleToggleFavorite(note._id, e)}
                        className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${note.isFavorite ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'
                          }`}
                      >
                        <Star size={16} fill={note.isFavorite ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteNote(note._id, note.title, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                    <Calendar size={12} />
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
                  <span className="text-xs font-semibold text-slate-400">
                    {note.quizAttempts?.length > 0
                      ? `${note.quizAttempts.length} Quiz Run${note.quizAttempts.length > 1 ? 's' : ''}`
                      : 'Not studied yet'}
                  </span>

                  <Link
                    to={`/note/${note._id}`}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:gap-2.5 transition-all"
                  >
                    Study Room
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        // Empty State
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <UploadCloud className="mx-auto text-slate-300 dark:text-slate-700 mb-4" size={48} />
          <h3 className="text-lg font-bold mb-2">
            {searchQuery ? 'No matching notes' : 'No study notes uploaded'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
            {searchQuery
              ? 'Try adjusting your search query to find your notes.'
              : 'Get started by uploading your first PDF slides or lecture notes. We will prepare your study kit.'}
          </p>
          {!searchQuery && (
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-lg transition-all"
            >
              Upload PDF
            </Link>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/50 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
          {error}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
