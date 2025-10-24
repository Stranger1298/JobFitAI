"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EnhancedAnalysisDashboard } from '@/components/enhanced-analysis-dashboard';

interface AnalysisResultsProps {
  analysis: string;
  resumePreview?: string;
  jobDescriptionPreview?: string;
  className?: string;
  onReset?: () => void;
}

export function AnalysisResults({ 
  analysis, 
  resumePreview, 
  jobDescriptionPreview, 
  className, 
  onReset 
}: AnalysisResultsProps) {
  const [showSourceFiles, setShowSourceFiles] = useState(false);

  return (
    <div className={cn("max-w-7xl mx-auto space-y-8", className)}>
      {/* Header with controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Analysis Complete
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review your results and action items below
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {(resumePreview || jobDescriptionPreview) && (
            <button
              onClick={() => setShowSourceFiles(!showSourceFiles)}
              className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {showSourceFiles ? 'Hide' : 'Show'} Source Files
            </button>
          )}
          
          {onReset && (
            <button
              onClick={onReset}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-lg transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Analyze Another Resume
            </button>
          )}
        </div>
      </motion.div>

      {/* Source Files Panel (Collapsible) */}
      {showSourceFiles && (resumePreview || jobDescriptionPreview) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="grid lg:grid-cols-2 gap-6 overflow-hidden"
        >
          {resumePreview && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                  <div className="p-2 bg-blue-500/10 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  Resume Content
                </h3>
              </div>
              <div className="p-6">
                <div className="max-h-96 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                    {resumePreview}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}

          {jobDescriptionPreview && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                  <div className="p-2 bg-purple-500/10 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                    </svg>
                  </div>
                  Job Description
                </h3>
              </div>
              <div className="p-6">
                <div className="max-h-96 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                    {jobDescriptionPreview}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Main Analysis Dashboard */}
      <EnhancedAnalysisDashboard analysis={analysis} />
      
      {/* Bottom Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 p-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/50"
      >
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Ready for the next step?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Use the insights above to optimize your resume and improve your chances
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center px-4 py-2 bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors duration-200">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Report
          </button>
          
          <button className="flex items-center px-4 py-2 bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors duration-200">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share Analysis
          </button>
        </div>
      </motion.div>
    </div>
  );
}