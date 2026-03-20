"use client";

import React from 'react';

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={{ willChange: 'transform' }}>
      {/* Base dark background */}
      <div className="absolute inset-0 bg-zinc-950" />

      {/* Subtle red accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-600/8 rounded-full blur-2xl opacity-40" />

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
}

export function BackgroundBeams() {
  return null;
}