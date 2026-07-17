import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNotes, toggleFavorite, deleteNote } from '../services/note';
import {
  Star,
  Trash2,
  ArrowRight,
  Calendar,
  Search,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Favorites = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotesList = async () => {
    try {
      const data = await getNotes();
      // Filter only favorites
      setNotes(data.filter(n => n.isFavorite));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotesList();
  }, []);

  const handleToggleFavorite = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleFavorite(id);
      // Remove from favorites list immediately
      setNotes(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (id, title, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await deleteNote(id);
      setNotes(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Favorite Notes</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Quick access to your bookmarked study decks.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search favorites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 glass-input text-sm text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Favorites List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((n) => (
            <div key={n} className="glass-card h-48 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse" />
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
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-500 transition-colors cursor-pointer"
                        title="Remove from favorites"
                      >
                        <Star size={16} fill="currentColor" />
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
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Star className="mx-auto text-slate-300 dark:text-slate-700 mb-4" size={48} />
          <h3 className="text-lg font-bold mb-2">No favorites yet</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
            {searchQuery
              ? 'No matching favorited notes found.'
              : 'You can bookmark study notes from the Dashboard or inside the Study Room to see them here.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Favorites;
