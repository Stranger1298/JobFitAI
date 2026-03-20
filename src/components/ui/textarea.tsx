"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {label && (
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          "w-full px-3 sm:px-4 py-2 sm:py-3 border border-zinc-700 rounded-xl shadow-sm",
          "bg-zinc-900/80 text-white",
          "focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50",
          "placeholder-zinc-500",
          "transition-all duration-300",
          "hover:border-zinc-600",
          "text-sm sm:text-base",
          error && "border-red-500 focus:ring-red-500 focus:border-red-500",
          className
        )}
        {...props}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}