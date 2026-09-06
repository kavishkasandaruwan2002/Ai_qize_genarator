import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const FlashcardView = ({ flashcards = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState({});
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'learning'
  const [filteredDeck, setFilteredDeck] = useState(flashcards);

  // Re-filter the deck when filterMode or masteredCards changes
  useEffect(() => {
    if (filterMode === 'learning') {
      const remaining = flashcards.filter((_, idx) => !masteredCards[idx]);
      setFilteredDeck(remaining);
      setCurrentIndex(0);
      setIsFlipped(false);
    } else {
      setFilteredDeck(flashcards);
    }
  }, [filterMode, masteredCards, flashcards]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < filteredDeck.length - 1) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1);
      }, 150);
    }
  };

  const toggleMastered = (originalIndex, e) => {
    e.stopPropagation(); // prevent card flip
    setMasteredCards(prev => ({
      ...prev,
      [originalIndex]: !prev[originalIndex]
    }));
  };

  const resetDeck = () => {
    setMasteredCards({});
    setFilterMode('all');
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <p className="text-slate-500 dark:text-slate-400 text-sm">No flashcards generated for this note.</p>
      </div>
    );
  }

  // Find the original index of the current card in the raw flashcards array
  const currentCard = filteredDeck[currentIndex];
  const originalIndex = flashcards.findIndex(
    card => card.question === currentCard?.question && card.answer === currentCard?.answer
  );
  const isCurrentCardMastered = !!masteredCards[originalIndex];

  // Calculate mastery statistics
  const masteredCount = Object.values(masteredCards).filter(Boolean).length;
  const masteryPercent = Math.round((masteredCount / flashcards.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Filters and Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterMode === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Cards ({flashcards.length})
          </button>
          <button
            onClick={() => setFilterMode('learning')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterMode === 'learning'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Still Learning ({flashcards.length - masteredCount})
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-400">Mastery</p>
            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{masteryPercent}% Completed</p>
          </div>
          <button 
            onClick={resetDeck}
            className="p-2 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
            title="Reset deck progress"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Deck Empty State (when filtering) */}
      {filteredDeck.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={40} />
          <h3 className="text-lg font-bold mb-2">All Cards Mastered!</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Awesome! You have marked all the flashcards in this deck as mastered.
          </p>
          <button
            onClick={resetDeck}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Study Again
          </button>
        </div>
      ) : (
        <>
          {/* 3D Flippable Card Container */}
          <div 
            className="w-full h-80 cursor-pointer"
            style={{ perspective: '1000px' }}
            onClick={handleFlip}
          >
            <motion.div
              className="w-full h-full relative rounded-2xl transition-all duration-500"
              style={{ 
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Front Side */}
              <div 
                className="absolute inset-0 w-full h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col justify-between shadow-sm dark:shadow-none"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles size={12} /> Question
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Card {currentIndex + 1} of {filteredDeck.length}
                  </span>
                </div>

                <div className="flex-1 flex items-center justify-center py-4">
                  <p className="text-lg md:text-xl font-bold text-center text-slate-800 dark:text-slate-100 leading-relaxed px-4">
                    {currentCard.question}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 pt-4">
                  <span className="text-xs text-slate-400 font-medium">Click card to flip</span>
                  <button
                    onClick={(e) => toggleMastered(originalIndex, e)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isCurrentCardMastered
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-50 hover:bg-emerald-50 dark:bg-slate-950 dark:hover:bg-emerald-950/20 text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400'
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    {isCurrentCardMastered ? 'Mastered' : 'Mark Mastered'}
                  </button>
                </div>
              </div>

              {/* Back Side */}
              <div 
                className="absolute inset-0 w-full h-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col justify-between shadow-sm dark:shadow-none"
                style={{ 
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 size={12} /> Answer
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Card {currentIndex + 1} of {filteredDeck.length}
                  </span>
                </div>

                <div className="flex-1 flex items-center justify-center py-4 overflow-y-auto max-h-[160px] pr-1">
                  <p className="text-base md:text-lg text-center text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                    {currentCard.answer}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/50 pt-4">
                  <span className="text-xs text-slate-400 font-medium">Click card to flip back</span>
                  <button
                    onClick={(e) => toggleMastered(originalIndex, e)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isCurrentCardMastered
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-50 hover:bg-emerald-50 dark:bg-slate-950 dark:hover:bg-emerald-950/20 text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400'
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    {isCurrentCardMastered ? 'Mastered' : 'Mark Mastered'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between px-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              <ChevronLeft size={18} />
              Previous
            </button>

            <span className="text-sm font-semibold text-slate-500">
              {currentIndex + 1} / {filteredDeck.length}
            </span>

            <button
              onClick={handleNext}
              disabled={currentIndex === filteredDeck.length - 1}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FlashcardView;
