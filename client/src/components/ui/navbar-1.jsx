"use client" 

import * as React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, BookOpen, Sun, Moon, LogOut } from "lucide-react"
import { isAuthenticated, logout } from "@/services/auth"

const Navbar1 = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const loggedIn = isAuthenticated()
  const navigate = useNavigate()

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setDarkMode(isDark)
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleMenu = () => setIsOpen(!isOpen)

  const navLinks = loggedIn ? [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Upload Notes", href: "/upload" },
    { name: "Favorites", href: "/favorites" },
  ] : [
    { name: "Home", href: "/" },
    { name: "Features", href: "/#features" },
    { name: "Login", href: "/login" },
    { name: "Register", href: "/register" },
  ]

  return (
    <div className="flex justify-center w-full py-4 px-4 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full shadow-lg border border-slate-200/50 dark:border-slate-800/50 w-full max-w-5xl relative z-10">
        
        {/* Brand Logo */}
        <div className="flex items-center">
          <Link
            to="/"
            className="flex items-center gap-2.5 mr-6 group"
          >
            <motion.div
              className="bg-indigo-600 p-2 rounded-full text-white shadow-md shadow-indigo-600/30 group-hover:rotate-6 transition-transform"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <BookOpen size={18} />
            </motion.div>
            <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
              StudyAI
            </span>
          </Link>
        </div>
        
        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((item) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <Link 
                to={item.href} 
                className="text-sm text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors font-medium"
              >
                {item.name}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {loggedIn ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
            >
              Get Started
            </Link>
          )}
        </div>

        {/* Mobile Menu & Theme Controls */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <motion.button 
            className="flex items-center p-1.5 rounded-lg text-slate-900 dark:text-slate-100" 
            onClick={toggleMenu} 
            whileTap={{ scale: 0.9 }}
          >
            <Menu className="h-6 w-6" />
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl z-50 pt-24 px-6 md:hidden flex flex-col justify-between pb-8"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.button
              className="absolute top-6 right-6 p-2 text-slate-900 dark:text-slate-100"
              onClick={toggleMenu}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.button>
            
            <div className="flex flex-col space-y-6">
              {navLinks.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.1 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Link 
                    to={item.href} 
                    className="text-xl text-slate-900 dark:text-slate-100 font-semibold hover:text-indigo-600 dark:hover:text-indigo-400" 
                    onClick={toggleMenu}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              exit={{ opacity: 0, y: 20 }}
              className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3"
            >
              {loggedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center w-full px-5 py-3 text-base font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
                    onClick={toggleMenu}
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => { handleLogout(); toggleMenu(); }}
                    className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 text-base font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-full"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center w-full px-5 py-3 text-base font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors"
                  onClick={toggleMenu}
                >
                  Get Started
                </Link>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { Navbar1 }
