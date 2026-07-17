import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { uploadNote } from '../services/note';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_PHASES = [
  'Reading PDF document...',
  'Extracting text content...',
  'Analyzing study material topics...',
  'Generating simple bullet-point summaries...',
  'Designing multiple-choice questions...',
  'Drafting Q&A flashcards...',
  'Saving to your study library...'
];

const PDFUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Cycle loading phases for AI generation
  useEffect(() => {
    let interval;
    if (aiProcessing) {
      interval = setInterval(() => {
        setLoadingPhase((prev) => (prev + 1) % LOADING_PHASES.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [aiProcessing]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const result = await uploadNote(file, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(percentCompleted);
        if (percentCompleted === 100) {
          setAiProcessing(true);
        }
      });

      // Redirect to Study Room
      navigate(`/note/${result._id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to upload and generate study materials. Please try again.');
      setUploading(false);
      setAiProcessing(false);
      setFile(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-800"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Upload Study Notes</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Upload your lecture slides, notes, or readings as a PDF. Our AI will automatically extract content, summarize it, and generate interactive quizzes and flashcards.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!uploading ? (
            <motion.div
              key="upload-zone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={onButtonClick}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-all duration-200 min-h-[220px] ${
                  dragActive
                    ? 'border-indigo-600 bg-indigo-50/30 dark:border-indigo-400 dark:bg-indigo-950/20'
                    : 'border-slate-300 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="application/pdf"
                  onChange={handleChange}
                />

                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-4">
                  <UploadCloud size={28} />
                </div>

                <p className="font-semibold text-sm mb-1">
                  Drag and drop your PDF here, or <span className="text-indigo-600 dark:text-indigo-400">browse</span>
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Supports PDF up to 10MB
                </p>
              </div>

              {/* Selected File Display */}
              {file && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-lg shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-slate-400">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleUpload}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
                  >
                    Generate Materials
                  </button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="uploading-zone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-8"
            >
              {!aiProcessing ? (
                // Uploading State
                <div className="w-full max-w-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Uploading PDF...</span>
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </div>
              ) : (
                // AI Processing State
                <div className="flex flex-col items-center text-center max-w-md">
                  <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400 mb-6" size={40} />
                  <h3 className="text-lg font-bold mb-2">Analyzing with AI</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 h-12 flex items-center justify-center font-medium animate-pulse-soft">
                    {LOADING_PHASES[loadingPhase]}
                  </p>
                  <span className="text-xs text-slate-400 mt-2">
                    This may take up to 30 seconds depending on the document size.
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/50 rounded-xl text-red-600 dark:text-red-400 flex items-start gap-3"
          >
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div className="text-sm font-medium">{error}</div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default PDFUpload;
