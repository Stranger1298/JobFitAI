"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("flex items-center justify-center", className)}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={cn(
          "border-2 border-red-900 border-t-red-500 rounded-full",
          sizes[size]
        )}
      />
    </motion.div>
  );
}

interface AnalysisLoadingProps {
  className?: string;
}

export function AnalysisLoading({ className }: AnalysisLoadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("w-full max-w-4xl mx-auto", className)}
    >
      <div className="relative">
        {/* Main loading card */}
        <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          {/* Top accent line */}
          <div className="absolute inset-x-0 top-0 h-0.5 bg-red-600 rounded-t-2xl" />
          
          <div className="text-center space-y-8">
            {/* Animated Logo/Icon */}
            <div className="flex justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <div className="w-20 h-20 rounded-2xl bg-red-600 flex items-center justify-center">
                  <motion.svg
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </motion.svg>
                </div>
              </motion.div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">
                Analyzing Your Resume
              </h3>
              <p className="text-zinc-400">
                Our AI is comparing your resume against the job description...
              </p>
            </div>

            {/* Progress bar */}
            <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-y-0 w-1/2 bg-red-600"
              />
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "Extracting Text", desc: "Reading your resume content", icon: "📄" },
                { title: "AI Analysis", desc: "Comparing with job requirements", icon: "🤖" },
                { title: "Generating Report", desc: "Creating improvement suggestions", icon: "📊" }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.2 }}
                  className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        delay: index * 0.3 
                      }}
                      className="text-2xl"
                    >
                      {step.icon}
                    </motion.div>
                    <div className="text-left">
                      <p className="font-semibold text-sm text-white">
                        {step.title}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {step.desc}
                      </p>
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: index * 0.2 }}
                      className="ml-auto w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}