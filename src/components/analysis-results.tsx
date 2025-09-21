"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnalysisResultsProps {
  analysis: string;
  className?: string;
}

export function AnalysisResults({ analysis, className }: AnalysisResultsProps) {
  // Parse the markdown-like analysis into sections
  const parseAnalysis = (text: string) => {
    const sections = text.split('##').filter(section => section.trim().length > 0);
    return sections.map(section => {
      const lines = section.trim().split('\n');
      const title = lines[0].trim();
      const content = lines.slice(1).join('\n').trim();
      return { title, content };
    });
  };

  const sections = parseAnalysis(analysis);

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      line = line.trim();
      if (line.startsWith('- ')) {
        return (
          <li key={index} className="ml-4 mb-2 flex items-start">
            <span className="text-blue-500 mr-2 mt-1">•</span>
            <span>{line.substring(2)}</span>
          </li>
        );
      } else if (line.startsWith('* ')) {
        return (
          <li key={index} className="ml-4 mb-2 flex items-start">
            <span className="text-blue-500 mr-2 mt-1">•</span>
            <span>{line.substring(2)}</span>
          </li>
        );
      } else if (line.startsWith('**') && line.endsWith('**')) {
        // Bold formatting for statistics and key metrics
        const boldText = line.slice(2, -2);
        return (
          <p key={index} className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
            {boldText}
          </p>
        );
      } else if (line.includes('Score:') || line.includes('Rate:') || line.includes('%')) {
        // Highlight scores and percentages
        return (
          <p key={index} className="mb-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 px-3 py-2 rounded-lg border-l-4 border-blue-400">
            <span className="font-medium text-blue-800 dark:text-blue-300">{line}</span>
          </p>
        );
      } else if (line.startsWith('Priority ') || line.startsWith('Strength ') || line.startsWith('Immediate ') || line.startsWith('Short-term ') || line.startsWith('Long-term ')) {
        // Highlight action items and priorities
        return (
          <p key={index} className="mb-2 font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/20 px-3 py-1 rounded-md">
            {line}
          </p>
        );
      } else if (line.length > 0) {
        return (
          <p key={index} className="mb-2 leading-relaxed">
            {line}
          </p>
        );
      }
      return null;
    });
  };

  const getSectionColor = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('score') || lowerTitle.includes('match')) {
      return 'border-blue-200/60 bg-gradient-to-br from-blue-50/90 via-white/80 to-indigo-50/70 dark:border-blue-500/30 dark:from-blue-950/40 dark:via-slate-900/60 dark:to-indigo-950/40 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20';
    } else if (lowerTitle.includes('strength') || lowerTitle.includes('competitiveness')) {
      return 'border-emerald-200/60 bg-gradient-to-br from-emerald-50/90 via-white/80 to-green-50/70 dark:border-emerald-500/30 dark:from-emerald-950/40 dark:via-slate-900/60 dark:to-green-950/40 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20';
    } else if (lowerTitle.includes('improvement') || lowerTitle.includes('missing') || lowerTitle.includes('action plan')) {
      return 'border-amber-200/60 bg-gradient-to-br from-amber-50/90 via-white/80 to-orange-50/70 dark:border-amber-500/30 dark:from-amber-950/40 dark:via-slate-900/60 dark:to-orange-950/40 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20';
    } else if (lowerTitle.includes('recommendation') || lowerTitle.includes('interview')) {
      return 'border-purple-200/60 bg-gradient-to-br from-purple-50/90 via-white/80 to-violet-50/70 dark:border-purple-500/30 dark:from-purple-950/40 dark:via-slate-900/60 dark:to-violet-950/40 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20';
    } else if (lowerTitle.includes('ats') || lowerTitle.includes('keyword') || lowerTitle.includes('optimization')) {
      return 'border-indigo-200/60 bg-gradient-to-br from-indigo-50/90 via-white/80 to-blue-50/70 dark:border-indigo-500/30 dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-blue-950/40 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20';
    } else if (lowerTitle.includes('skills') || lowerTitle.includes('technical')) {
      return 'border-cyan-200/60 bg-gradient-to-br from-cyan-50/90 via-white/80 to-teal-50/70 dark:border-cyan-500/30 dark:from-cyan-950/40 dark:via-slate-900/60 dark:to-teal-950/40 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20';
    } else if (lowerTitle.includes('experience') || lowerTitle.includes('career')) {
      return 'border-rose-200/60 bg-gradient-to-br from-rose-50/90 via-white/80 to-pink-50/70 dark:border-rose-500/30 dark:from-rose-950/40 dark:via-slate-900/60 dark:to-pink-950/40 shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20';
    } else if (lowerTitle.includes('education') || lowerTitle.includes('certification')) {
      return 'border-violet-200/60 bg-gradient-to-br from-violet-50/90 via-white/80 to-purple-50/70 dark:border-violet-500/30 dark:from-violet-950/40 dark:via-slate-900/60 dark:to-purple-950/40 shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20';
    } else if (lowerTitle.includes('structure') || lowerTitle.includes('format')) {
      return 'border-slate-200/60 bg-gradient-to-br from-slate-50/90 via-white/80 to-gray-50/70 dark:border-slate-500/30 dark:from-slate-950/40 dark:via-slate-900/60 dark:to-gray-950/40 shadow-lg shadow-slate-500/10 hover:shadow-slate-500/20';
    }
    return 'border-gray-200/60 bg-gradient-to-br from-white/90 via-gray-50/80 to-slate-50/70 dark:border-gray-500/30 dark:from-gray-800/40 dark:via-slate-800/60 dark:to-gray-900/40 shadow-lg shadow-gray-500/10 hover:shadow-gray-500/20';
  };

  const getSectionIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('score') || lowerTitle.includes('match')) {
      return (
        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    } else if (lowerTitle.includes('strength') || lowerTitle.includes('competitiveness')) {
      return (
        <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    } else if (lowerTitle.includes('skills') || lowerTitle.includes('technical')) {
      return (
        <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
    } else if (lowerTitle.includes('experience') || lowerTitle.includes('career')) {
      return (
        <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
        </svg>
      );
    } else if (lowerTitle.includes('education') || lowerTitle.includes('certification')) {
      return (
        <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      );
    } else if (lowerTitle.includes('keyword') || lowerTitle.includes('ats') || lowerTitle.includes('optimization')) {
      return (
        <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      );
    } else if (lowerTitle.includes('improvement') || lowerTitle.includes('missing') || lowerTitle.includes('action')) {
      return (
        <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    } else if (lowerTitle.includes('recommendation') || lowerTitle.includes('interview')) {
      return (
        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    } else if (lowerTitle.includes('structure') || lowerTitle.includes('format')) {
      return (
        <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("w-full space-y-6", className)}
    >
      <div className="text-center mb-8">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-700 bg-clip-text text-transparent mb-3"
        >
          Resume Analysis Results
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-600 dark:text-gray-400 text-lg"
        >
          AI-powered insights to improve your resume
        </motion.p>
      </div>

      <div className="grid gap-6">
        {sections.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={cn(
              "group relative border rounded-2xl p-8 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1",
              getSectionColor(section.title)
            )}
          >
            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/20 to-transparent rounded-tr-2xl" />
            
            {/* Header with icon and title */}
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 p-3 rounded-xl bg-white/50 dark:bg-white/10 shadow-sm">
                {getSectionIcon(section.title)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
                  {section.title}
                </h3>
                <div className="h-0.5 w-12 bg-gradient-to-r from-current to-transparent opacity-30" />
              </div>
            </div>
            
            {/* Content area */}
            <div className="text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
              {formatContent(section.content)}
            </div>
            
            {/* Bottom border accent */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}