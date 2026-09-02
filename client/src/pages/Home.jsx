import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Sparkles, 
  FileText, 
  HelpCircle, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Zap, 
  Shield, 
  Moon, 
  Sun 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { isAuthenticated } from '../services/auth';
import { HeroGeometric } from '@/components/ui/shape-landing-hero';

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
    
    // Theme initialization
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500 overflow-hidden relative">
      
      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between absolute top-0 left-0 right-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-md shadow-indigo-600/20">
            <BookOpen size={22} />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
            StudyAI
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isLoggedIn ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md transition-all"
            >
              Go to Dashboard
              <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/15 hover:shadow-lg hover:shadow-indigo-600/25 transition-all"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <HeroGeometric
        badge="AI-Powered Learning Suite"
        title1="Study Smarter, Not Harder with"
        title2="AI Study Assistant"
        description="Upload your lecture slides, notes, or textbook PDFs. Our advanced AI automatically extracts key concepts, generates clean summaries, builds interactive quizzes, and designs custom flashcard decks."
      >
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <Link
            to={isLoggedIn ? "/dashboard" : "/register"}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base px-8 py-4 rounded-2xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:scale-[1.02] transition-all cursor-pointer w-full sm:w-auto justify-center"
          >
            Get Started Free
            <ArrowRight size={18} />
          </Link>
          
          <a
            href="#features"
            className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-base px-8 py-4 rounded-2xl transition-all cursor-pointer w-full sm:w-auto"
          >
            Explore Features
          </a>
        </div>

        {/* Dashboard Preview mockup (with fade-in-up animation) */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
          className="mt-16 w-full max-w-5xl rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl relative bg-white/[0.02] backdrop-blur-md p-2 mx-auto"
        >
          <div className="rounded-2xl overflow-hidden bg-[#030303]/80 border border-white/[0.08] aspect-[16/9] flex items-center justify-center">
            {/* Simulated UI Preview */}
            <div className="w-full h-full p-6 flex flex-col justify-between text-left">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-white/40 ml-4">AI Study Room - Biology_Lec3.pdf</span>
                </div>
                <div className="h-5 w-24 bg-white/[0.05] rounded-md" />
              </div>

              <div className="flex-1 grid grid-cols-3 gap-6 py-6">
                <div className="col-span-1 bg-white/[0.02] rounded-xl p-4 border border-white/[0.05] flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-indigo-500/10 text-indigo-400 rounded px-2 text-[10px] font-bold w-max">SUMMARY</div>
                    <div className="h-3 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/10 rounded w-5/6" />
                    <div className="h-3 bg-white/10 rounded w-2/3" />
                  </div>
                  <div className="h-2 bg-indigo-500 rounded-full w-2/3" />
                </div>

                <div className="col-span-1 bg-white/[0.02] rounded-xl p-4 border border-white/[0.05] flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-emerald-500/10 text-emerald-400 rounded px-2 text-[10px] font-bold w-max">MCQ QUIZ</div>
                    <div className="h-3 bg-white/10 rounded w-full" />
                    <div className="space-y-1">
                      <div className="h-5 bg-white/[0.03] rounded w-full border border-white/[0.05]" />
                      <div className="h-5 bg-emerald-500/10 rounded w-full border border-emerald-500/20" />
                    </div>
                  </div>
                  <div className="h-6 bg-white/[0.05] rounded-lg w-full" />
                </div>

                <div className="col-span-1 bg-white/[0.02] rounded-xl p-4 border border-white/[0.05] flex flex-col justify-between items-center justify-center">
                  <div className="h-4 bg-purple-500/10 text-purple-400 rounded px-2 text-[10px] font-bold w-max mb-4">FLASHCARDS</div>
                  <div className="w-full aspect-[4/3] max-w-[120px] rounded-lg border border-white/[0.08] bg-white/[0.01] flex flex-col justify-center items-center shadow-md">
                    <Layers className="text-indigo-400 mb-1" size={20} />
                    <span className="text-[9px] font-bold text-white/40">Card 1 of 12</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded w-1/2 mt-4" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </HeroGeometric>

      {/* Features Grid (Scroll Triggered) */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-200/50 dark:border-slate-800/50 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-3">All the Tools You Need to Ace Exams</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            AI Study Assistant converts any PDF notes into three specialized revision formats.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className="glass-card p-8 rounded-3xl"
          >
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl w-max mb-6">
              <FileText size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3">1. Clean Summaries</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
              Get simple, easy-to-digest bullet points covering the core concepts of your lectures. Check off points as you revise to track your progress.
            </p>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Revision Checklists included &rarr;</span>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="glass-card p-8 rounded-3xl"
          >
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl w-max mb-6">
              <HelpCircle size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3">2. MCQ Quizzes</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
              Test your recall with 10–15 multiple-choice questions per note. Get instant feedback on answers, save scores, and download quizzes as printable PDFs.
            </p>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">PDF Download & Grading included &rarr;</span>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card p-8 rounded-3xl"
          >
            <div className="p-4 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-2xl w-max mb-6">
              <Layers size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3">3. Smart Flashcards</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
              Study definitions and key equations with 3D flippable flashcards. Mark cards as mastered to filter your deck and focus only on what you need to practice.
            </p>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">3D Flip Deck & Practice Filters included &rarr;</span>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section (Scroll timeline animation) */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-200/50 dark:border-slate-800/50 relative z-10 bg-slate-100/30 dark:bg-slate-900/10 rounded-[40px]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">TIMELINE</span>
          <h2 className="text-3xl md:text-4xl font-black mt-2 mb-3">How It Works</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Three simple steps to generate a complete revision suite from your lecture slides.
          </p>
        </div>

        <div className="max-w-3xl mx-auto relative border-l-2 border-slate-200 dark:border-slate-800 pl-8 md:pl-12 space-y-16 py-4">
          
          {/* Step 1 */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Timeline node */}
            <div className="absolute left-[-41px] md:left-[-57px] top-1.5 h-6 w-6 rounded-full bg-indigo-600 border-4 border-white dark:border-slate-950 shadow-md flex items-center justify-center" />
            
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400">01.</span> Upload your PDF notes
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Drag and drop any PDF file up to 10MB into the dashboard upload zone. We support lecture slides, textbook chapters, or handwritten note exports.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Timeline node */}
            <div className="absolute left-[-41px] md:left-[-57px] top-1.5 h-6 w-6 rounded-full bg-violet-600 border-4 border-white dark:border-slate-950 shadow-md" />
            
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <span className="text-violet-600 dark:text-violet-400">02.</span> AI Processing
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Our backend extracts the PDF text and passes it to Google Gemini 2.0. In parallel, the AI summarizes the text, drafts multiple-choice questions, and designs flashcards.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Timeline node */}
            <div className="absolute left-[-41px] md:left-[-57px] top-1.5 h-6 w-6 rounded-full bg-purple-600 border-4 border-white dark:border-slate-950 shadow-md" />
            
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <span className="text-purple-600 dark:text-purple-400">03.</span> Interactive Revision
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Enter the Study Room to study. Take the interactive quiz to test your memory, flip through 3D flashcards, and check off summary topics as you master them.
            </p>
          </motion.div>

        </div>
      </section>

      {/* Call to Action Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[40px] bg-gradient-to-tr from-indigo-900 via-slate-900 to-indigo-950 text-white p-12 md:p-16 border border-indigo-500/20"
        >
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <Cpu className="text-indigo-400 mx-auto animate-pulse-slow" size={40} />
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Ready to ace your exams?</h2>
            <p className="text-indigo-200/80 text-base leading-relaxed font-medium">
              Join thousands of students using AI Study Assistant to turn dense lecture slides into interactive, high-retention study kits.
            </p>
            <div className="pt-4">
              <Link
                to={isLoggedIn ? "/dashboard" : "/register"}
                className="inline-flex items-center gap-2.5 bg-white text-indigo-950 hover:bg-indigo-50 font-extrabold text-base px-8 py-4 rounded-2xl shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
              >
                Get Started For Free
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
          {/* Background shapes */}
          <div className="absolute right-[-10%] bottom-[-10%] w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          <div className="absolute left-[-10%] top-[-10%] w-96 h-96 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200/50 dark:border-slate-800/50 relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-600 p-2 rounded-xl text-white">
            <BookOpen size={16} />
          </div>
          <span className="font-bold tracking-tight text-slate-800 dark:text-slate-200">
            StudyAI
          </span>
        </div>
        <p>&copy; 2026 StudyAI. Built for students worldwide.</p>
      </footer>

    </div>
  );
};

export default Home;
