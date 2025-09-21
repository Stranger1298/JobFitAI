"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  glass?: boolean;
}

export function Card({ children, className, hover = true, gradient = false, glass = false }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { y: -5, scale: 1.02 } : {}}
      className={cn(
        "relative overflow-hidden rounded-xl border",
        glass 
          ? "bg-gradient-to-br from-white/20 via-blue-50/10 to-slate-50/10 backdrop-blur-xl border-white/30 shadow-2xl shadow-blue-500/10" 
          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg",
        gradient && "bg-gradient-to-br from-blue-50/80 via-slate-50/60 to-indigo-100/40 dark:from-blue-950/30 dark:via-slate-950/20 dark:to-indigo-950/30",
        hover && "transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/15",
        className
      )}
    >
      {glass && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 via-slate-200/10 to-indigo-200/20 pointer-events-none" />
      )}
      {children}
    </motion.div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("px-8 pt-8 pb-6", className)}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn("px-8 pb-8", className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function CardTitle({ children, className, icon }: CardTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={cn("flex items-center gap-4", className)}
    >
      {icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="flex-shrink-0 p-2 rounded-lg bg-white/20 dark:bg-white/10 shadow-sm"
        >
          {icon}
        </motion.div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 leading-tight">
          {children}
        </h3>
        <div className="h-0.5 w-16 bg-gradient-to-r from-current to-transparent opacity-30" />
      </div>
    </motion.div>
  );
}

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export function GlowCard({ children, className, glowColor = "blue" }: GlowCardProps) {
  const glowColors = {
    blue: "shadow-blue-500/20 hover:shadow-blue-400/30 border-blue-200/40 hover:border-blue-300/60",
    purple: "shadow-purple-500/20 hover:shadow-purple-400/30 border-purple-200/40 hover:border-purple-300/60",
    green: "shadow-emerald-500/20 hover:shadow-emerald-400/30 border-emerald-200/40 hover:border-emerald-300/60",
    orange: "shadow-orange-500/20 hover:shadow-orange-400/30 border-orange-200/40 hover:border-orange-300/60",
    pink: "shadow-pink-500/20 hover:shadow-pink-400/30 border-pink-200/40 hover:border-pink-300/60",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl backdrop-blur-xl border-2 transition-all duration-500",
        "bg-gradient-to-br from-white/25 via-white/15 to-white/10 dark:from-white/10 dark:via-white/5 dark:to-white/2",
        glowColors[glowColor as keyof typeof glowColors],
        className
      )}
    >
      {/* Top shine effect */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      
      {/* Corner decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/15 to-transparent rounded-tr-2xl" />
      
      {/* Main gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
      
      {/* Colored glow effect */}
      <div className={cn(
        "absolute inset-0 opacity-15 blur-2xl transition-opacity duration-500 group-hover:opacity-25",
        glowColor === "blue" && "bg-gradient-to-br from-blue-400/30 to-indigo-600/20",
        glowColor === "purple" && "bg-gradient-to-br from-purple-400/30 to-violet-600/20",
        glowColor === "green" && "bg-gradient-to-br from-emerald-400/30 to-teal-600/20",
        glowColor === "orange" && "bg-gradient-to-br from-orange-400/30 to-amber-500/20",
        glowColor === "pink" && "bg-gradient-to-br from-pink-400/30 to-rose-500/20"
      )} />
      
      {/* Content container */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />
    </motion.div>
  );
}