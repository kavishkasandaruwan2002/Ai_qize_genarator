import React, { useState } from 'react';
import { Copy, Check, Search, Sparkles, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const SummaryView = ({ summary = [], title = 'Study Note' }) => {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedPoints, setCheckedPoints] = useState({});

  const handleCopy = () => {
    const textToCopy = summary.map(point => `• ${point}`).join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleCheckPoint = (index) => {
    setCheckedPoints(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const filteredSummary = summary.filter(point =>
    point.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const checkedCount = Object.values(checkedPoints).filter(Boolean).length;
  const progressPercent = summary.length > 0 ? Math.round((checkedCount / summary.length) * 100) : 0;

  // Framer motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-xs text-slate-500">Key revision concepts extracted from your notes</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 w-full sm:w-48 transition-all"
            />
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium transition-colors cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <Check size={16} className="text-emerald-500" />
                <span className="text-emerald-500">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} className="text-slate-500" />
                <span>Copy All</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {summary.length > 0 && (
        <div className="bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-950/30 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <BookOpen size={16} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">Revision Progress:</span>
          </div>
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
              {checkedCount}/{summary.length} ({progressPercent}%)
            </span>
          </div>
        </div>
      )}

      {/* Summary List */}
      {filteredSummary.length > 0 ? (
        <motion.ul
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {filteredSummary.map((point, index) => {
            const isChecked = !!checkedPoints[index];
            return (
              <motion.li
                key={index}
                variants={itemVariants}
                onClick={() => toggleCheckPoint(index)}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${isChecked
                    ? 'bg-emerald-50/30 border-emerald-200/50 dark:bg-emerald-950/10 dark:border-emerald-900/30 opacity-75'
                    : 'bg-white border-slate-200/60 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800/60 dark:hover:border-slate-700'
                  }`}
              >
                {/* Custom Checkbox */}
                <div className={`mt-0.5 h-5 w-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${isChecked
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500'
                  }`}>
                  {isChecked && <Check size={14} strokeWidth={3} />}
                </div>

                {/* Bullet text */}
                <span className={`text-sm md:text-base leading-relaxed ${isChecked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                  {point}
                </span>
              </motion.li>
            );
          })}
        </motion.ul>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {searchQuery ? 'No matching concepts found.' : 'No summary available.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SummaryView;
