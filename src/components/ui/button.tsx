"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient' | 'glow' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  onClick,
  type = 'button',
  icon,
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    secondary: "bg-zinc-800 hover:bg-zinc-700 text-white focus:ring-zinc-500 border border-zinc-700",
    outline: "border-2 border-zinc-700 bg-transparent hover:bg-zinc-800 text-white focus:ring-zinc-500",
    gradient: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    glow: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    danger: "bg-red-700 hover:bg-red-800 text-white focus:ring-red-500",
  };

  const sizes = {
    sm: "px-3 sm:px-4 py-2 text-xs sm:text-sm",
    md: "px-4 sm:px-6 py-2 sm:py-3 text-sm",
    lg: "px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base",
    xl: "px-6 sm:px-10 py-3 sm:py-5 text-base sm:text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.01 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.99 }}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
    >
      <div className="flex items-center gap-2">
        {loading && (
          <motion.svg
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </motion.svg>
        )}
        {!loading && icon && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.div>
        )}
        {children}
      </div>
    </motion.button>
  );
}