"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { cn } from '@/lib/utils';

interface JobDescriptionUploadProps {
  onFileSelect: (file: File) => void;
  onClearFile: () => void;
  selectedFile: File | null;
  className?: string;
}

export function JobDescriptionUpload({ 
  onFileSelect, 
  onClearFile,
  selectedFile,
  className 
}: JobDescriptionUploadProps) {
  const [error, setError] = useState<string>('');

  const accept = {
    'application/pdf': ['.pdf'],
    'text/plain': ['.txt']
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    setError('');
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors.some((e) => e.code === 'file-too-large')) {
        setError('File is too large. Maximum size is 10MB.');
      } else if (rejection.errors.some((e) => e.code === 'file-invalid-type')) {
        setError('Invalid file type. Please upload PDF or TXT files.');
      } else {
        setError('Invalid file. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      onFileSelect(selectedFile);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const removeFile = () => {
    setError('');
    onClearFile();
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200",
          isDragActive 
            ? "border-red-500 bg-red-500/10" 
            : "border-zinc-700 hover:border-red-500/50 bg-zinc-900",
          error && "border-red-500 bg-red-950/20",
          selectedFile && "border-green-500 bg-green-500/10"
        )}
      >
        <input {...getInputProps()} />
        <div className="space-y-3">
          {!selectedFile ? (
            <>
              <div className="mx-auto w-10 h-10 text-red-500">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {isDragActive ? "Drop job description here" : "Upload job description file"}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Drag and drop or click to browse
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Supports PDF, TXT (max 10MB)
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <div className="mx-auto w-10 h-10 text-green-500 bg-green-500/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-zinc-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors font-medium"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
    </div>
  );
}