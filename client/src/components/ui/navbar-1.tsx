"use client" 

import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, BookOpen } from "lucide-react"

const Navbar1 = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Upload Notes", href: "/upload" },
    { name: "Favorites", href: "/favorites" },
  ]

  return (
    <div className="flex justify-center w-full py-6 px-4">
      <div className="flex items-center justify-between px-6 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full shadow-lg border border-slate-200/50 dark:border-slate-800/50 w-full max-w-4xl relative z-10">
        <div className="flex items-center">
          <motion.a
            href="/"
            className="flex items-center gap-2.5 mr-6 group"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-indigo-600 p-2 rounded-full text-white shadow-md shadow-indigo-600/30 group-hover:rotate-6 transition-transform">
              <BookOpen size={18} />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
              StudyAI
            </span>
          </motion.a>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((item) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <a 
                href={item.href} 
                className="text-sm text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors font-medium"
              >
                {item.name}
              </a>
            </motion.div>
          ))}
        </nav>

        {/* Desktop CTA Button */}
        <motion.div
          className="hidden md:block"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
        >
          <a
            href="/login"
            className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
          >
            Get Started
          </a>
        </motion.div>

        {/* Mobile Menu Button */}
        <motion.button className="md:hidden flex items-center p-1.5 rounded-lg text-slate-900 dark:text-slate-100" onClick={toggleMenu} whileTap={{ scale: 0.9 }}>
          <Menu className="h-6 w-6" />
        </motion.button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-white dark:bg-slate-950 z-50 pt-24 px-6 md:hidden"
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
                  <a 
                    href={item.href} 
                    className="text-lg text-slate-900 dark:text-slate-100 font-medium hover:text-indigo-600 dark:hover:text-indigo-400" 
                    onClick={toggleMenu}
                  >
                    {item.name}
                  </a>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                exit={{ opacity: 0, y: 20 }}
                className="pt-6 border-t border-slate-200 dark:border-slate-800"
              >
                <a
                  href="/login"
                  className="inline-flex items-center justify-center w-full px-5 py-3 text-base font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
                  onClick={toggleMenu}
                >
                  Get Started
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { Navbar1 }
