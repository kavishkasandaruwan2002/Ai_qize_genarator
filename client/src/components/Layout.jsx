import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  UploadCloud,
  Star,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  User
} from 'lucide-react';
import { logout, getCurrentUser } from '../services/auth';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  // Initialize dark mode
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Notes', path: '/upload', icon: UploadCloud },
    { name: 'Favorites', path: '/favorites', icon: Star },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500 relative overflow-hidden">
      {/* Premium Background Glow Orbs */}
      <div className="glow-orb w-[500px] h-[500px] bg-indigo-500/8 dark:bg-indigo-500/5 top-[-10%] left-[20%]" />
      <div className="glow-orb w-[400px] h-[400px] bg-violet-500/8 dark:bg-violet-500/5 bottom-[5%] right-[5%]" style={{ animationDelay: '-4s' }} />
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-slate-200/50 dark:border-slate-800/50 fixed h-full z-30">
        <Link 
          to="/" 
          className="p-6 flex items-center gap-3 border-b border-slate-200/50 dark:border-slate-800/50 hover:opacity-90 group transition-all duration-200"
        >
          <div className="bg-indigo-600 p-2 rounded-xl text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-md shadow-indigo-600/10 group-hover:shadow-indigo-600/35">
            <BookOpen size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400 group-hover:from-indigo-500 group-hover:to-violet-400 transition-all duration-200">
            StudyAI
          </span>
        </Link>

        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm border-l-4 transition-all duration-200 ${isActive
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border-l-indigo-600 dark:border-l-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-100 border-l-transparent'
                  }`}
              >
                <Icon size={18} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User profile & Logout footer */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
              {currentUser?.username?.charAt(0) || <User size={16} />}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{currentUser?.username || 'Student'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3.5 w-full px-4 py-2.5 rounded-xl font-medium text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            {/* Sidebar */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 z-50 p-6 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 md:hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 group"
                  >
                    <div className="bg-indigo-600 p-2 rounded-xl text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-md shadow-indigo-600/10">
                      <BookOpen size={20} />
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400 group-hover:from-indigo-500 group-hover:to-violet-400 transition-all duration-200">
                      StudyAI
                    </span>
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                  >
                    <X size={20} />
                  </button>
                </div>

                <nav className="space-y-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${isActive
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50'
                          }`}
                      >
                        <Icon size={18} />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 px-2">
                  <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
                    {currentUser?.username?.charAt(0) || <User size={16} />}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold truncate">{currentUser?.username}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser?.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3.5 w-full px-4 py-2.5 rounded-xl font-medium text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">

        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-8 py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-900/50 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 md:hidden text-slate-600 dark:text-slate-400"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              {location.pathname === '/' && 'Dashboard'}
              {location.pathname === '/upload' && 'Upload Notes'}
              {location.pathname === '/favorites' && 'Favorites'}
              {location.pathname.startsWith('/note/') && 'Study Room'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105 transition-all duration-200 cursor-pointer"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User Avatar (Desktop) */}
            <div className="hidden md:flex h-9 w-9 rounded-xl bg-indigo-600 text-white items-center justify-center font-bold uppercase shadow-sm">
              {currentUser?.username?.charAt(0)}
            </div>
          </div>
        </header>

        {/* Main Panel Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
