"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileUpload } from '@/components/ui/file-upload';
import { JobDescriptionUpload } from '@/components/ui/job-description-upload';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CardHeader, CardContent, CardTitle, GlowCard } from '@/components/ui/card';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { AnalysisDashboard } from '@/components/analysis-dashboard';
import { AnalysisLoading } from '@/components/ui/loading';

export default function Home() {
  const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(null);
  const [selectedJDFile, setSelectedJDFile] = useState<File | null>(null);
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  
  // Use a ref to track if a request is in progress to prevent duplicates
  const requestInProgress = useRef(false);

  // Cleanup effect to abort any ongoing requests when component unmounts
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);

  const handleResumeFileSelect = (file: File) => {
    setSelectedResumeFile(file);
    setError(null);
  };

  const handleJDFileSelect = (file: File) => {
    setSelectedJDFile(file);
    setError(null);
  };

  const handleJDFileClear = () => {
    setSelectedJDFile(null);
  };

  const handleAnalyze = async () => {
    if (!selectedResumeFile) {
      setError('Please upload a resume file');
      return;
    }

    if (!jobDescriptionText && inputMode === 'text') {
      setError('Please enter a job description');
      return;
    }

    if (!selectedJDFile && inputMode === 'file') {
      setError('Please upload a job description file');
      return;
    }

    // Prevent duplicate requests by checking if already loading or request in progress
    if (loading || requestInProgress.current) {
      return;
    }

    // Set request in progress flag
    requestInProgress.current = true;

    // Cancel any previous request
    if (abortController) {
      abortController.abort();
    }

    // Create new abort controller for this request
    const newAbortController = new AbortController();
    setAbortController(newAbortController);

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append('resume', selectedResumeFile);
      
      if (inputMode === 'text') {
        formData.append('jobDescription', jobDescriptionText);
      } else if (selectedJDFile) {
        formData.append('jobDescriptionFile', selectedJDFile);
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
        signal: newAbortController.signal,
      });

      // Check if request was aborted before processing response
      if (newAbortController.signal.aborted) {
        return;
      }

      let data;
      if (response.ok) {
        // For successful responses, parse as JSON directly
        data = await response.json();
      } else {
        // For error responses, read as text and parse error message
        const errorText = await response.text();
        let errorMessage = 'Failed to analyze resume';
        try {
          const parsed = JSON.parse(errorText);
          errorMessage = parsed?.error || errorMessage;
        } catch {
          errorMessage = errorText || `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      // Check if request was aborted after parsing
      if (newAbortController.signal.aborted) {
        return;
      }

      if (!data.analysis) {
        throw new Error('No analysis data received from server');
      }

      setAnalysis(data.analysis);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was aborted, don't show error
        return;
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setAbortController(null);
      requestInProgress.current = false;
    }
  };

  const handleReset = () => {
    // Cancel any ongoing request
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    
    // Reset request flag
    requestInProgress.current = false;
    
    setSelectedResumeFile(null);
    setSelectedJDFile(null);
    setJobDescriptionText('');
    setAnalysis(null);
    setError(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="bg-gradient-to-r from-slate-700 via-blue-600 to-slate-700 bg-clip-text text-transparent">
              AI Resume Analyzer
            </span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Upload your resume and job description to get AI-powered insights and improvement suggestions
          </motion.p>
        </motion.div>

        {!loading && !analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-6xl mx-auto"
          >
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Resume Upload Section */}
              <GlowCard glowColor="blue" className="p-8">
                <CardHeader className="p-0 pb-6">
                  <CardTitle 
                    icon={
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    }
                    className="text-white"
                  >
                    Upload Your Resume
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <FileUpload onFileSelect={handleResumeFileSelect} />
                  {selectedResumeFile && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl backdrop-blur-sm"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-1 bg-green-500/20 rounded-full">
                          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-green-300">
                          {selectedResumeFile.name} uploaded successfully
                        </span>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </GlowCard>

              <GlowCard glowColor="purple" className="p-8">
                <CardHeader className="p-0 pb-6">
                  <CardTitle 
                    icon={
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                        </svg>
                      </div>
                    }
                    className="text-white"
                  >
                    Job Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-6">
                  {/* Input Mode Toggle */}
                  <div className="flex gap-2 p-1 bg-white/5 rounded-lg backdrop-blur-sm">
                    <button
                      onClick={() => setInputMode('text')}
                      className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        inputMode === 'text'
                          ? 'bg-purple-500 text-white shadow-lg'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      Type Text
                    </button>
                    <button
                      onClick={() => setInputMode('file')}
                      className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        inputMode === 'file'
                          ? 'bg-purple-500 text-white shadow-lg'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      Upload File
                    </button>
                  </div>

                  {inputMode === 'text' ? (
                    <Textarea
                      placeholder="Paste the job description here..."
                      value={jobDescriptionText}
                      onChange={(e) => setJobDescriptionText(e.target.value)}
                      rows={12}
                      className="min-h-[300px] bg-white/5 border-white/10 text-white placeholder-gray-400 backdrop-blur-sm"
                    />
                  ) : (
                    <JobDescriptionUpload
                      onFileSelect={handleJDFileSelect}
                      onClearFile={handleJDFileClear}
                      selectedFile={selectedJDFile}
                    />
                  )}
                </CardContent>
              </GlowCard>
            </div>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="relative rounded-2xl border-2 border-red-200/60 bg-gradient-to-br from-red-50/90 via-white/80 to-pink-50/70 dark:border-red-500/30 dark:from-red-950/40 dark:via-slate-900/60 dark:to-pink-950/40 shadow-lg shadow-red-500/10 backdrop-blur-sm p-6">
                  {/* Top shine effect */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-300/40 to-transparent" />
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 p-3 bg-red-100/80 dark:bg-red-900/30 rounded-xl">
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-red-700 dark:text-red-300 font-semibold text-lg">{error}</span>
                    </div>
                  </div>
                  
                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-400/30 to-transparent" />
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex justify-center space-x-6"
            >
              <Button
                onClick={handleAnalyze}
                disabled={
                  loading ||
                  !selectedResumeFile || 
                  (inputMode === 'text' && !jobDescriptionText.trim()) ||
                  (inputMode === 'file' && !selectedJDFile)
                }
                variant="gradient"
                size="xl"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                }
              >
                Analyze Resume
              </Button>
              {(selectedResumeFile || jobDescriptionText || selectedJDFile) && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="xl"
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  }
                >
                  Reset
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && <AnalysisLoading />}

        {/* Results */}
        {analysis && !loading && (
          <div className="max-w-7xl mx-auto">
            <AnalysisDashboard analysis={analysis} />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="mt-8 text-center"
            >
              <Button 
                onClick={handleReset} 
                variant="glow" 
                size="xl"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
              >
                Analyze Another Resume
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
