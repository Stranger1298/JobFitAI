"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUpload } from '@/components/ui/file-upload';
import { JobDescriptionUpload } from '@/components/ui/job-description-upload';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CardHeader, CardContent, CardTitle, GlowCard } from '@/components/ui/card';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { EnhancedAnalysisDashboard } from '@/components/enhanced-analysis-dashboard';
import { AnalysisLoading } from '@/components/ui/loading';
import { DUMMY_JOB_DESCRIPTIONS } from '@/lib/dummy-job-descriptions';
import { ProResumeWorkspace } from '@/components/pro-resume-workspace';
import { ImprovementTestResult } from '@/types/pro';

// Lazy load the workspace component
const LazyProResumeWorkspace = React.lazy(() => import('@/components/pro-resume-workspace').then(mod => ({ default: mod.ProResumeWorkspace })));

// Sample data for demo
const DEFAULT_SAMPLE_JOB_DESCRIPTION = DUMMY_JOB_DESCRIPTIONS[0]?.description || '';
const IMPROVEMENT_TESTS_STORAGE_KEY = 'jobfit-improvement-tests';
const DODO_DIRECT_CHECKOUT_URL = 'https://checkout.dodopayments.com/buy/pdt_0NatX1yls1LB7umZFnu8V?quantity=1';

// History item type
interface AnalysisHistoryItem {
  id: string;
  timestamp: Date;
  resumeName: string;
  jobTitle: string;
  overallScore: number;
  analysis: string;
}

export default function Home() {
  const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(null);
  const [selectedJDFile, setSelectedJDFile] = useState<File | null>(null);
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [hasProAccess, setHasProAccess] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedDummyJDId, setSelectedDummyJDId] = useState<string>(
    DUMMY_JOB_DESCRIPTIONS[0]?.id || ''
  );
  const [latestResumeText, setLatestResumeText] = useState('');
  const [latestJobDescription, setLatestJobDescription] = useState('');
  const [baselineScore, setBaselineScore] = useState<number | null>(null);
  const [improvementTests, setImprovementTests] = useState<ImprovementTestResult[]>([]);

  // Use a ref to track if a request is in progress to prevent duplicates
  const requestInProgress = useRef(false);
  // Ref to store handleAnalyze function for keyboard shortcuts
  const handleAnalyzeRef = useRef<() => void>(() => { });

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('jobfit-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((item: AnalysisHistoryItem) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }
  }, []);

  useEffect(() => {
    const checkProAccess = async () => {
      try {
        const response = await fetch('/api/payments/access', { signal: AbortSignal.timeout(3000) });
        if (!response.ok) return;
        const data = await response.json();
        setHasProAccess(Boolean(data?.hasAccess));
      } catch (e) {
        // Silently fail - don't log, just use default false value
        setHasProAccess(false);
      }
    };

    checkProAccess();
  }, []);

  useEffect(() => {
    const savedTests = localStorage.getItem(IMPROVEMENT_TESTS_STORAGE_KEY);
    if (!savedTests) return;
    try {
      setImprovementTests(JSON.parse(savedTests));
    } catch {
      setImprovementTests([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(IMPROVEMENT_TESTS_STORAGE_KEY, JSON.stringify(improvementTests));
  }, [improvementTests]);

  // Save history to localStorage when it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('jobfit-history', JSON.stringify(history));
    }
  }, [history]);

  // Cleanup effect to abort any ongoing requests when component unmounts
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to analyze
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (selectedResumeFile && (jobDescriptionText || selectedJDFile) && !loading) {
          e.preventDefault();
          handleAnalyzeRef.current();
        }
      }
      // Escape to close modals
      if (e.key === 'Escape') {
        setShowHistory(false);
        setShowShareModal(false);
        setShowAnnouncements(false);
      }
      // Ctrl/Cmd + H to toggle history
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setShowHistory(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading]);

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

  // Load sample data for demo
  const loadSampleData = useCallback(() => {
    setJobDescriptionText(DEFAULT_SAMPLE_JOB_DESCRIPTION);
    setInputMode('text');
    setError(null);
  }, []);

  const loadDummyJobDescription = useCallback((id?: string) => {
    const selectedId = id || selectedDummyJDId;
    const selected = DUMMY_JOB_DESCRIPTIONS.find((item) => item.id === selectedId);
    if (!selected) return;
    setJobDescriptionText(selected.description);
    setInputMode('text');
    setError(null);
  }, [selectedDummyJDId]);

  const verifyPaymentSession = useCallback(async (sessionId: string) => {
    const response = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });

    const data = await response.json();
    if (response.ok && data?.success) {
      setHasProAccess(true);
      return true;
    }

    return false;
  }, []);

  useEffect(() => {
    const attemptPaymentVerification = async () => {
      const url = new URL(window.location.href);
      const querySessionId =
        url.searchParams.get('checkout_session_id') ||
        url.searchParams.get('session_id') ||
        url.searchParams.get('checkout_id');
      const pendingSessionId = localStorage.getItem('jobfit-pending-checkout-id');
      const sessionId = querySessionId || pendingSessionId;

      if (!sessionId) return;

      try {
        setPaymentLoading(true);
        const ok = await verifyPaymentSession(sessionId);
        if (ok) {
          localStorage.removeItem('jobfit-pending-checkout-id');
          setError(null);
        }
      } catch (e) {
        console.error('Payment verification failed:', e);
      } finally {
        setPaymentLoading(false);
        if (url.searchParams.has('payment') || querySessionId) {
          url.searchParams.delete('payment');
          url.searchParams.delete('checkout_session_id');
          url.searchParams.delete('session_id');
          url.searchParams.delete('checkout_id');
          window.history.replaceState({}, '', url.toString());
        }
      }
    };

    attemptPaymentVerification();
  }, [verifyPaymentSession]);

  const handleUnlockPro = useCallback(async () => {
    try {
      setPaymentLoading(true);
      setError(null);
      window.location.href = DODO_DIRECT_CHECKOUT_URL;
    } catch (err) {
      setPaymentLoading(false);
      setError(err instanceof Error ? err.message : 'Payment failed to start.');
    }
  }, []);

  // Copy analysis to clipboard
  const copyToClipboard = useCallback(async () => {
    if (!analysis) return;
    try {
      await navigator.clipboard.writeText(analysis);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [analysis]);

  // Export analysis as text file
  const exportAnalysis = useCallback(() => {
    if (!analysis) return;
    const blob = new Blob([analysis], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-analysis-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [analysis]);

  // Save to history
  const saveToHistory = useCallback((analysisText: string, resumeName: string) => {
    const scoreMatch = analysisText.match(/(?:Overall.*Score|Match.*Score):?\s*[^\d]*(\d+(?:\.\d+)?)[%\/]?/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

    const jobTitleMatch = jobDescriptionText.match(/^([^\n]+)/i);
    const jobTitle = jobTitleMatch ? jobTitleMatch[1].trim().substring(0, 50) : 'Job Analysis';

    const newItem: AnalysisHistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date(),
      resumeName: resumeName,
      jobTitle: jobTitle,
      overallScore: score,
      analysis: analysisText
    };

    setHistory(prev => [newItem, ...prev].slice(0, 10)); // Keep last 10
  }, [jobDescriptionText]);

  // Load from history
  const loadFromHistory = useCallback((item: AnalysisHistoryItem) => {
    setAnalysis(item.analysis);
    setShowHistory(false);
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('jobfit-history');
  }, []);

  const extractOverallScore = useCallback((analysisText: string): number => {
    const scoreMatch = analysisText.match(/(?:Overall.*Score|Match.*Score):?\s*[^\d]*(\d+(?:\.\d+)?)[%\/]?/i);
    return scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
  }, []);

  const handleSaveTestResult = useCallback((result: ImprovementTestResult) => {
    setImprovementTests((prev) => [...prev, result].slice(-20));
  }, []);

  const handleRunImprovementTest = useCallback(async (editedResumeText: string): Promise<number> => {
    const activeJD = latestJobDescription || jobDescriptionText;
    if (!activeJD.trim()) {
      throw new Error('Job description is missing for improvement test.');
    }

    const formData = new FormData();
    formData.append('resumeText', editedResumeText);
    formData.append('jobDescription', activeJD);
    formData.append('analysisMode', 'pro');

    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (!response.ok || !data?.analysis) {
      throw new Error(data?.error || 'Failed to test improved resume.');
    }

    setAnalysis(data.analysis);
    const nextScore = extractOverallScore(data.analysis);
    return nextScore;
  }, [extractOverallScore, jobDescriptionText, latestJobDescription]);

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
      formData.append('analysisMode', 'free');

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

      if (typeof data.hasProAccess === 'boolean') {
        setHasProAccess(data.hasProAccess);
      }

      setAnalysis(data.analysis);
      const nextBaselineScore = extractOverallScore(data.analysis);
      setBaselineScore(nextBaselineScore);
      setLatestResumeText(String(data.resumeTextFull || ''));
      setLatestJobDescription(String(data.jobDescriptionFull || jobDescriptionText || ''));
      setImprovementTests([]);
      localStorage.removeItem(IMPROVEMENT_TESTS_STORAGE_KEY);
      // Save to history
      if (selectedResumeFile) {
        saveToHistory(data.analysis, selectedResumeFile.name);
      }
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

  // Update ref for keyboard shortcuts
  handleAnalyzeRef.current = handleAnalyze;

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
    setLatestResumeText('');
    setLatestJobDescription('');
    setBaselineScore(null);
    setImprovementTests([]);
    localStorage.removeItem(IMPROVEMENT_TESTS_STORAGE_KEY);
    setError(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />

      {/* Fixed Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 sm:w-6 h-5 sm:h-6 text-white" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-lg sm:text-xl font-bold text-white truncate">JobFit <span className="text-red-500">AI</span></span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
              <button
                onClick={() => setShowAnnouncements(true)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs sm:text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors flex-shrink-0"
                title="What's New"
              >
                <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5a2 2 0 114 0c0 1.1-.9 2-2 2h0a2 2 0 01-2-2zm2 4v6m0 4h.01M5 12a7 7 0 1114 0c0 2.576 1 4 2 5H3c1-1 2-2.424 2-5z" />
                </svg>
                <span className="hidden sm:inline">What&apos;s New</span>
              </button>
              {/* History Button */}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="relative flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs sm:text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors flex-shrink-0"
              >
                <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">History</span>
                {history.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center text-xs">
                    {history.length}
                  </span>
                )}
              </button>
              <span className="text-xs sm:text-sm text-zinc-500 hidden lg:block whitespace-nowrap">AI-Powered Resume Analysis</span>
            </div>
          </div>
        </div>
      </header>

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 md:w-80 bg-zinc-900 border-l border-zinc-800 z-50 shadow-2xl overflow-y-auto"
          >
            <div className="p-3 sm:p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-white">Analysis History</h3>
              <button onClick={() => setShowHistory(false)} className="text-zinc-400 hover:text-white flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-3 sm:p-4 space-y-3">
              {history.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-8">No analysis history yet</p>
              ) : (
                <>
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => loadFromHistory(item)}
                      className="w-full text-left p-2 sm:p-3 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-red-500/50 transition-colors text-xs sm:text-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white truncate text-xs sm:text-sm">{item.resumeName}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 ml-2 ${item.overallScore >= 80 ? 'bg-green-500/20 text-green-400' :
                          item.overallScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                          {item.overallScore}%
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 truncate">{item.jobTitle}</p>
                      <p className="text-xs text-zinc-600 mt-1">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                  <button
                    onClick={clearHistory}
                    className="w-full text-center text-xs text-red-400 hover:text-red-300 py-2"
                  >
                    Clear History
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Share Analysis</h3>
              <p className="text-zinc-400 text-xs sm:text-sm mb-4">
                Your analysis has been copied! You can share it via email or messaging apps.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    copyToClipboard();
                    setShowShareModal(false);
                  }}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-3 sm:px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors text-sm sm:flex-1"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcement Modal */}
      <AnimatePresence>
        {showAnnouncements && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={() => setShowAnnouncements(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 max-w-xl w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6 sticky top-0 bg-zinc-900 pb-3">
                <h3 className="text-lg sm:text-xl font-bold text-white">What&apos;s New</h3>
                <button onClick={() => setShowAnnouncements(false)} className="text-zinc-400 hover:text-white flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-zinc-300">
                <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-2.5 sm:p-3">
                  <p className="font-semibold text-white mb-1">Pro Resume Builder is now live</p>
                  <p className="text-xs sm:text-sm">Use structured editing for Summary, Experience, Skills, Education, and Projects.</p>
                </div>
                <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-2.5 sm:p-3">
                  <p className="font-semibold text-white mb-1">Professional Templates + Preview</p>
                  <p className="text-xs sm:text-sm">Switch between Classic, Modern, and Compact layouts with document-style preview.</p>
                </div>
                <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-2.5 sm:p-3">
                  <p className="font-semibold text-white mb-1">AI Rewrite + Improvement Testing</p>
                  <p className="text-xs sm:text-sm">Rewrite each section using AI and test score changes against your baseline analysis.</p>
                </div>
                <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-2.5 sm:p-3">
                  <p className="font-semibold text-white mb-1">Export Options</p>
                  <p className="text-xs sm:text-sm">Download edited resume as TXT or PDF directly from the Pro workspace.</p>
                </div>
              </div>
              <div className="mt-5 flex justify-end sticky bottom-0 bg-zinc-900 pt-3">
                <button
                  onClick={() => setShowAnnouncements(false)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12 px-2 sm:px-0"
        >
          <motion.h1
            className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4 text-white leading-tight"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Analyze Your Resume with <span className="text-red-500">AI</span>
          </motion.h1>
          <motion.p
            className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Upload your resume and job description to get instant AI-powered insights.
          </motion.p>

          {/* Feature badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-4 sm:mt-6"
          >
            {[
              { icon: "🎯", label: "ATS Optimization" },
              { icon: "📊", label: "Skills Analysis" },
              { icon: "💡", label: "Smart Suggestions" },
              { icon: "⚡", label: "Instant Results" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-zinc-900/80 border border-zinc-800 rounded-full text-xs sm:text-sm text-zinc-300"
              >
                <span>{feature.icon}</span>
                <span className="hidden sm:inline">{feature.label}</span>
                <span className="sm:hidden">{feature.label.split(' ')[0]}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-4 sm:mt-6 text-center px-2"
          >
            <p className="text-xs text-zinc-500">
              💡 <span className="text-zinc-400">Pro tip:</span> Use the exact job posting for best results.
            </p>
          </motion.div>
        </motion.div>

        {!loading && !analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Resume Upload Section */}
              <GlowCard className="p-4 sm:p-6">
                <CardHeader className="p-0 pb-3 sm:pb-4">
                  <CardTitle
                    icon={
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    }
                    className="text-white text-base sm:text-lg"
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
                      className="mt-2 sm:mt-3 p-2 sm:p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-xs sm:text-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-green-400 truncate">
                          {selectedResumeFile.name}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </GlowCard>

              <GlowCard className="p-4 sm:p-6">
                <CardHeader className="p-0 pb-3 sm:pb-4">
                  <CardTitle
                    icon={
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                      </svg>
                    }
                    className="text-white text-base sm:text-lg"
                  >
                    Job Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-3 sm:space-y-4">
                  {/* Input Mode Toggle */}
                  <div className="flex p-1 bg-zinc-800 rounded-lg border border-zinc-700">
                    <button
                      onClick={() => setInputMode('text')}
                      className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${inputMode === 'text'
                        ? 'bg-red-600 text-white'
                        : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                      Type Text
                    </button>
                    <button
                      onClick={() => setInputMode('file')}
                      className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${inputMode === 'file'
                        ? 'bg-red-600 text-white'
                        : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                      Upload File
                    </button>
                  </div>

                  {/* Try Sample Button */}
                  {inputMode === 'text' && !jobDescriptionText && (
                    <button
                      onClick={loadSampleData}
                      className="w-full py-2 text-xs sm:text-sm text-zinc-400 border border-dashed border-zinc-700 rounded-lg hover:border-red-500/50 hover:text-red-400 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-3.5 sm:w-4 h-3.5 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Try with sample job description
                    </button>
                  )}

                  {inputMode === 'text' && (
                    <div className="space-y-2 sm:space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/70 p-2 sm:p-3">
                      <p className="text-xs text-zinc-400">
                        Free Dummy JDs: test quickly with your own resume plus platform-provided job descriptions.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          value={selectedDummyJDId}
                          onChange={(e) => setSelectedDummyJDId(e.target.value)}
                          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2 sm:px-3 py-2 text-xs sm:text-sm text-zinc-200 focus:border-red-500 focus:outline-none"
                        >
                          {DUMMY_JOB_DESCRIPTIONS.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.title} ({item.level})
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => loadDummyJobDescription()}
                          className="rounded-lg border border-zinc-700 px-2 sm:px-3 py-2 text-xs sm:text-sm text-zinc-300 hover:border-red-500/60 hover:text-white transition-colors whitespace-nowrap"
                        >
                          Load Selected
                        </button>
                      </div>
                    </div>
                  )}

                  {inputMode === 'text' ? (
                    <div className="relative">
                      <Textarea
                        placeholder="Paste the job description here..."
                        value={jobDescriptionText}
                        onChange={(e) => setJobDescriptionText(e.target.value)}
                        rows={6}
                        className="min-h-[150px] sm:min-h-[200px] bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500 focus:border-red-500 focus:ring-red-500/20 text-xs sm:text-sm"
                      />
                      <div className="flex justify-between mt-2 text-xs text-zinc-500">
                        <span>{jobDescriptionText.trim().split(/\s+/).filter(Boolean).length} words</span>
                        <span className="hidden sm:inline">{jobDescriptionText.length} characters</span>
                      </div>
                    </div>
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
                className="mb-6 sm:mb-8"
              >
                <div className="rounded-xl border border-red-500/50 bg-red-950/20 p-3 sm:p-4">
                  <div className="flex gap-2 sm:gap-3">
                    <div className="flex-shrink-0 p-1.5 sm:p-2 bg-red-600 rounded-lg">
                      <svg className="w-4 sm:w-5 h-4 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-red-400 font-medium text-sm break-words">{error}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 md:gap-6"
            >
              <Button
                onClick={handleAnalyze}
                disabled={
                  loading ||
                  !selectedResumeFile ||
                  (inputMode === 'text' && !jobDescriptionText.trim()) ||
                  (inputMode === 'file' && !selectedJDFile)
                }
                variant="glow"
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

            {/* Keyboard Shortcut Hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center text-xs text-zinc-600 mt-3 sm:mt-4 px-2"
            >
              <span className="block sm:inline">Press <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-400 font-mono text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-400 font-mono text-xs">Enter</kbd> to analyze </span>
              <span className="block sm:inline">• <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-400 font-mono text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-400 font-mono text-xs">H</kbd> for history</span>
            </motion.p>

            {/* Features Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-20"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Why Use <span className="text-red-500">JobFit AI</span>?
                </h2>
                <p className="text-zinc-400 max-w-2xl mx-auto">
                  Our AI-powered platform helps you optimize your resume for any job application
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: "📈",
                    title: "ATS Score Analysis",
                    description: "Get detailed insights on how well your resume performs against Applicant Tracking Systems used by 90% of companies."
                  },
                  {
                    icon: "🎯",
                    title: "Keyword Matching",
                    description: "Identify missing keywords and skills that recruiters are looking for in your target role."
                  },
                  {
                    icon: "💡",
                    title: "Smart Suggestions",
                    description: "Receive personalized recommendations to improve your resume's impact and relevance."
                  },
                  {
                    icon: "⚡",
                    title: "Instant Analysis",
                    description: "Get comprehensive results in seconds, not hours. Our AI processes your documents quickly."
                  },
                  {
                    icon: "📊",
                    title: "Skills Gap Analysis",
                    description: "Understand the gap between your current skills and what the job requires."
                  },
                  {
                    icon: "🏆",
                    title: "Competitive Edge",
                    description: "Stand out from other candidates with a perfectly optimized resume tailored to each job."
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="feature-card rounded-2xl p-6 backdrop-blur-sm"
                  >
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-20 py-12 border-t border-b border-zinc-800"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { value: "10K+", label: "Resumes Analyzed" },
                  { value: "95%", label: "User Satisfaction" },
                  { value: "3x", label: "More Interviews" },
                  { value: "24/7", label: "AI Availability" }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.3 + index * 0.1 }}
                    className="stat-animate"
                  >
                    <div className="text-3xl md:text-4xl font-bold text-red-500 mb-2">{stat.value}</div>
                    <div className="text-zinc-400 text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && <AnalysisLoading />}

        {/* Results */}
        {analysis && !loading && (
          <div className="space-y-6 sm:space-y-8">
            {!hasProAccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-red-500/30 bg-zinc-900/90 p-3 sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white">Unlock Pro Resume Builder - ₹99</h3>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                      Get AI improvement recommendations, edit your resume on-platform, switch templates, and test score improvements.
                    </p>
                  </div>
                  <div className="w-full flex flex-col gap-2">
                    <button
                      onClick={handleUnlockPro}
                      disabled={paymentLoading}
                      className="rounded-lg bg-red-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-red-700 disabled:opacity-70 w-full sm:w-auto"
                    >
                      {paymentLoading ? 'Processing...' : 'Unlock & Edit on Platform'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {hasProAccess && (
              <ProResumeWorkspace
                sourceResumeText={latestResumeText}
                jobDescription={latestJobDescription || jobDescriptionText}
                baselineScore={baselineScore}
                testResults={improvementTests}
                onSaveTestResult={handleSaveTestResult}
                onRunImprovementTest={handleRunImprovementTest}
              />
            )}

            {/* Action Bar */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap justify-center gap-2 sm:gap-3"
            >
              <button
                onClick={copyToClipboard}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${copySuccess
                  ? 'bg-green-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-red-500/50 hover:text-white'
                  }`}
              >
                {copySuccess ? (
                  <>
                    <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="hidden sm:inline">Copied!</span>
                    <span className="sm:hidden">Copy</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={exportAnalysis}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-lg text-xs sm:text-sm font-medium hover:border-red-500/50 hover:text-white transition-all"
              >
                <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden sm:inline">Download</span>
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-lg text-xs sm:text-sm font-medium hover:border-red-500/50 hover:text-white transition-all"
              >
                <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-lg text-xs sm:text-sm font-medium hover:border-red-500/50 hover:text-white transition-all"
              >
                <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span className="hidden sm:inline">Print</span>
              </button>
            </motion.div>

            <EnhancedAnalysisDashboard analysis={analysis} resumeText={latestResumeText} />

            {/* Back to Home Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center"
            >
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                }
              >
                Analyze Another Resume
              </Button>
            </motion.div>
          </div>
        )}

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-12 sm:mt-20 pb-6 sm:pb-8 border-t border-zinc-800 pt-8 sm:pt-12"
        >
          <div className="max-w-6xl mx-auto px-3 sm:px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-white truncate">JobFit <span className="text-red-500">AI</span></span>
                </div>
                <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed max-w-sm">
                  AI-powered resume analysis tool that helps you optimize your resume for any job application. Get instant feedback and actionable insights.
                </p>
              </div>

              {/* Features */}
              <div>
                <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Features</h4>
                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-zinc-500">
                  <li className="hover:text-zinc-400 transition-colors cursor-pointer">ATS Optimization</li>
                  <li className="hover:text-zinc-400 transition-colors cursor-pointer">Skills Analysis</li>
                  <li className="hover:text-zinc-400 transition-colors cursor-pointer">Keyword Matching</li>
                  <li className="hover:text-zinc-400 transition-colors cursor-pointer">Interview Tips</li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Resources</h4>
                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-zinc-500">
                  <li className="hover:text-zinc-400 transition-colors cursor-pointer">Resume Templates</li>
                  <li className="hover:text-zinc-400 transition-colors cursor-pointer">Career Blog</li>
                  <li className="hover:text-zinc-400 transition-colors cursor-pointer">FAQ</li>
                  <li className="hover:text-zinc-400 transition-colors cursor-pointer">Support</li>
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-zinc-800 pt-6 sm:pt-8 flex flex-col gap-3 sm:gap-4 text-center sm:text-left">
              <p className="text-zinc-600 text-xs sm:text-sm">
                © 2026 JobFit AI. All rights reserved.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-6">
                <span className="text-zinc-600 text-xs sm:text-sm hover:text-zinc-400 cursor-pointer transition-colors">Privacy Policy</span>
                <span className="text-zinc-600 text-xs sm:text-sm hover:text-zinc-400 cursor-pointer transition-colors">Terms of Service</span>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
