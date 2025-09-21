"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ScoreChart, SkillsRadarChart, ComparisonBarChart, ProgressRing } from '@/components/ui/charts';
import { cn } from '@/lib/utils';

interface AnalysisDashboardProps {
  analysis: string;
  className?: string;
}

interface ParsedAnalysis {
  overallScore: number;
  skillsScore: number;
  atsScore: number;
  experienceScore: number;
  educationScore: number;
  keywordMatchRate: number;
  sections: { title: string; content: string }[];
  skills: { skill: string; score: number }[];
  comparisons: { category: string; current: number; target: number }[];
}

export function AnalysisDashboard({ analysis, className }: AnalysisDashboardProps) {
  const parseAnalysis = (text: string): ParsedAnalysis => {
    const sections = text.split('##').filter(section => section.trim().length > 0);
    const sectionData = sections.map(section => {
      const lines = section.trim().split('\n');
      const title = lines[0].trim();
      const content = lines.slice(1).join('\n').trim();
      return { title, content };
    });

    // Extract scores using improved regex patterns
    const extractScore = (pattern: RegExp, defaultValue: number = 0): number => {
      const match = text.match(pattern);
      if (match) {
        const scoreText = match[1];
        const numMatch = scoreText.match(/(\d+)/);
        return numMatch ? Math.min(100, Math.max(0, parseInt(numMatch[1]))) : defaultValue;
      }
      return defaultValue;
    };

    // Look for specific score patterns in the text
    const overallScore = extractScore(/(?:Overall.*Score|Match.*Score):?\s*[^\d]*(\d+(?:\.\d+)?)[%\/]?/i, 75);
    const skillsScore = extractScore(/(?:Skill.*Gap.*Score|Technical.*Skills.*Found).*?(\d+)\s*out\s*of\s*(\d+)/i, 60);
    const atsScore = extractScore(/(?:ATS.*Score|ATS.*Compatibility):?\s*[^\d]*(\d+(?:\.\d+)?)[%\/]?/i, 65);
    const experienceScore = extractScore(/(?:Experience.*Score|Years.*Experience):?\s*[^\d]*(\d+(?:\.\d+)?)[%\/]?/i, 80);
    const educationScore = extractScore(/(?:Education.*Score):?\s*[^\d]*(\d+(?:\.\d+)?)[%\/]?/i, 85);
    const keywordMatchRate = extractScore(/(?:Keyword.*Match.*Rate):?\s*[^\d]*(\d+(?:\.\d+)?)[%\/]?/i, 60);

    // Parse technical skills from the analysis
    const skillsFound = text.match(/Technical Skills Found.*?(\d+)\s*out\s*of\s*(\d+)/i);
    let actualSkillsScore = skillsScore;
    if (skillsFound) {
      const found = parseInt(skillsFound[1]);
      const total = parseInt(skillsFound[2]);
      actualSkillsScore = Math.round((found / total) * 100);
    }

    // Extract individual skills mentioned in the text
    const skillMatches = text.match(/\*\*([^:*]+):\*\*\s*([^(]*(?:\([^)]*\))?)/g) || [];
    const extractedSkills = skillMatches.slice(0, 8).map((match, index) => {
      const skillMatch = match.match(/\*\*([^:*]+):\*\*\s*([^(]*)/);
      if (skillMatch) {
        const skillName = skillMatch[1].trim();
        const proficiency = skillMatch[2].trim().toLowerCase();
        
        let score = 50; // default
        if (proficiency.includes('proficient')) score = 85;
        else if (proficiency.includes('familiar')) score = 60;
        else if (proficiency.includes('expert')) score = 95;
        else if (proficiency.includes('beginner')) score = 40;
        else if (proficiency.includes('advanced')) score = 90;
        
        return { skill: skillName, score };
      }
      return { skill: `Skill ${index + 1}`, score: 70 };
    });

    // If we don't have enough extracted skills, add some defaults
    const skills = extractedSkills.length >= 5 ? extractedSkills : [
      { skill: 'Technical Skills', score: actualSkillsScore },
      { skill: 'Experience', score: experienceScore },
      { skill: 'Education', score: educationScore },
      { skill: 'Keywords', score: keywordMatchRate },
      { skill: 'ATS Optimization', score: atsScore },
      ...extractedSkills
    ].slice(0, 8);

    // Enhanced comparison data based on analysis
    const comparisons = [
      { category: 'Skills Match', current: actualSkillsScore, target: 90 },
      { category: 'Experience', current: experienceScore, target: 85 },
      { category: 'Keywords', current: keywordMatchRate, target: 80 },
      { category: 'ATS Score', current: atsScore, target: 95 }
    ];

    return {
      overallScore,
      skillsScore: actualSkillsScore,
      atsScore,
      experienceScore,
      educationScore,
      keywordMatchRate,
      sections: sectionData,
      skills,
      comparisons
    };
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      line = line.trim();
      
      // Handle bullet points
      if (line.startsWith('- ') || line.startsWith('• ')) {
        const bulletText = line.substring(2);
        return (
          <li key={index} className="ml-4 mb-3 flex items-start">
            <span className="text-blue-500 mr-3 mt-1 text-sm font-bold">•</span>
            <span className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{bulletText}</span>
          </li>
        );
      }
      
      // Handle skills with proficiency levels
      else if (line.match(/\*\*([^:*]+):\*\*\s*([^(]*(?:\([^)]*\))?)/)) {
        const skillMatch = line.match(/\*\*([^:*]+):\*\*\s*([^(]*(?:\([^)]*\))?)/);
        if (skillMatch) {
          const skillName = skillMatch[1].trim();
          const proficiency = skillMatch[2].trim();
          
          let proficiencyColor = 'bg-gray-100 text-gray-700';
          let proficiencyIcon = '📋';
          
          if (proficiency.toLowerCase().includes('proficient')) {
            proficiencyColor = 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
            proficiencyIcon = '✅';
          } else if (proficiency.toLowerCase().includes('familiar')) {
            proficiencyColor = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
            proficiencyIcon = '📚';
          } else if (proficiency.toLowerCase().includes('expert')) {
            proficiencyColor = 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
            proficiencyIcon = '🏆';
          } else if (proficiency.toLowerCase().includes('advanced')) {
            proficiencyColor = 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
            proficiencyIcon = '🚀';
          }
          
          return (
            <div key={index} className="mb-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="mr-2 text-lg">{proficiencyIcon}</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{skillName}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${proficiencyColor}`}>
                  {proficiency}
                </span>
              </div>
            </div>
          );
        }
      }
      
      // Handle bold headers
      else if (line.startsWith('**') && line.endsWith('**')) {
        const boldText = line.slice(2, -2);
        return (
          <div key={index} className="mb-4 mt-6 first:mt-0">
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <span className="mr-2 text-blue-500">📊</span>
              {boldText}
            </h4>
            <div className="h-0.5 w-16 bg-gradient-to-r from-blue-500 to-purple-500 mt-1" />
          </div>
        );
      }
      
      // Handle score lines
      else if (line.includes('Score:') || line.includes('Rate:') || line.includes('%') || line.includes('out of')) {
        const scoreMatch = line.match(/(\d+)(?:\s*out\s*of\s*(\d+)|%|\s*\/\s*100)/);
        let scorePercentage = null;
        
        if (scoreMatch) {
          if (scoreMatch[2]) {
            // "X out of Y" format
            scorePercentage = Math.round((parseInt(scoreMatch[1]) / parseInt(scoreMatch[2])) * 100);
          } else {
            // Direct percentage
            scorePercentage = parseInt(scoreMatch[1]);
          }
        }
        
        return (
          <div key={index} className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 px-4 py-3 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-800 dark:text-blue-300 text-sm">{line}</span>
              {scorePercentage !== null && (
                <div className="flex items-center">
                  <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                    <div 
                      className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, scorePercentage)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-blue-600">{scorePercentage}%</span>
                </div>
              )}
            </div>
          </div>
        );
      }
      
      // Handle priority/strength/immediate items
      else if (line.match(/^(Priority|Strength|Immediate|Missing|Recommendations?|Critical)/i)) {
        let bgColor = 'bg-purple-50 dark:bg-purple-950/20';
        let textColor = 'text-purple-700 dark:text-purple-300';
        let icon = '⭐';
        
        if (line.toLowerCase().includes('missing') || line.toLowerCase().includes('critical')) {
          bgColor = 'bg-red-50 dark:bg-red-950/20';
          textColor = 'text-red-700 dark:text-red-300';
          icon = '🚨';
        } else if (line.toLowerCase().includes('strength')) {
          bgColor = 'bg-green-50 dark:bg-green-950/20';
          textColor = 'text-green-700 dark:text-green-300';
          icon = '💪';
        } else if (line.toLowerCase().includes('recommendation')) {
          bgColor = 'bg-blue-50 dark:bg-blue-950/20';
          textColor = 'text-blue-700 dark:text-blue-300';
          icon = '💡';
        }
        
        return (
          <div key={index} className={`mb-3 ${textColor} ${bgColor} px-4 py-2 rounded-lg border border-current border-opacity-20 flex items-center`}>
            <span className="mr-2 text-lg">{icon}</span>
            <span className="font-medium text-sm">{line}</span>
          </div>
        );
      }
      
      // Regular text content
      else if (line.length > 0) {
        return (
          <p key={index} className="mb-3 leading-relaxed text-sm text-gray-700 dark:text-gray-300">
            {line}
          </p>
        );
      }
      
      return null;
    });
  };

  const getSectionIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('score') || lowerTitle.includes('match')) {
      return (
        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  const parsedData = parseAnalysis(analysis);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("w-full space-y-8", className)}
    >
      {/* Header */}
      <div className="text-center">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-700 bg-clip-text text-transparent mb-3"
        >
          Resume Analysis Dashboard
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-600 dark:text-gray-400 text-lg"
        >
          Comprehensive insights with visual analytics
        </motion.p>
      </div>

      {/* Key Metrics Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
          <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Key Performance Metrics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <ScoreChart score={parsedData.overallScore} title="Overall Match" color="#3B82F6" />
          <ScoreChart score={parsedData.skillsScore} title="Skills Match" color="#10B981" />
          <ScoreChart score={parsedData.atsScore} title="ATS Score" color="#8B5CF6" />
          <ScoreChart score={parsedData.keywordMatchRate} title="Keywords" color="#F59E0B" />
          <ScoreChart score={parsedData.experienceScore} title="Experience" color="#EF4444" />
        </div>

        {/* Quick Insights */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border-l-4 ${parsedData.overallScore >= 70 ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : parsedData.overallScore >= 50 ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-red-400 bg-red-50 dark:bg-red-900/20'}`}>
            <h4 className={`font-semibold text-sm ${parsedData.overallScore >= 70 ? 'text-green-800 dark:text-green-300' : parsedData.overallScore >= 50 ? 'text-yellow-800 dark:text-yellow-300' : 'text-red-800 dark:text-red-300'}`}>
              📊 Overall Assessment
            </h4>
            <p className={`text-xs mt-1 ${parsedData.overallScore >= 70 ? 'text-green-700 dark:text-green-400' : parsedData.overallScore >= 50 ? 'text-yellow-700 dark:text-yellow-400' : 'text-red-700 dark:text-red-400'}`}>
              {parsedData.overallScore >= 70 ? 'Strong match! Your resume aligns well with the job requirements.' : 
               parsedData.overallScore >= 50 ? 'Good foundation with room for improvement in key areas.' : 
               'Significant gaps identified. Focus on missing skills and keywords.'}
            </p>
          </div>
          
          <div className={`p-4 rounded-lg border-l-4 ${parsedData.skillsScore >= 70 ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : parsedData.skillsScore >= 50 ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-red-400 bg-red-50 dark:bg-red-900/20'}`}>
            <h4 className={`font-semibold text-sm ${parsedData.skillsScore >= 70 ? 'text-green-800 dark:text-green-300' : parsedData.skillsScore >= 50 ? 'text-yellow-800 dark:text-yellow-300' : 'text-red-800 dark:text-red-300'}`}>
              🎯 Skills Gap
            </h4>
            <p className={`text-xs mt-1 ${parsedData.skillsScore >= 70 ? 'text-green-700 dark:text-green-400' : parsedData.skillsScore >= 50 ? 'text-yellow-700 dark:text-yellow-400' : 'text-red-700 dark:text-red-400'}`}>
              {parsedData.skillsScore >= 70 ? 'Excellent technical skill alignment with the role.' : 
               parsedData.skillsScore >= 50 ? 'Some relevant skills present, consider highlighting more.' : 
               'Critical skills missing. Prioritize learning key technologies.'}
            </p>
          </div>
          
          <div className={`p-4 rounded-lg border-l-4 ${parsedData.atsScore >= 70 ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : parsedData.atsScore >= 50 ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-red-400 bg-red-50 dark:bg-red-900/20'}`}>
            <h4 className={`font-semibold text-sm ${parsedData.atsScore >= 70 ? 'text-green-800 dark:text-green-300' : parsedData.atsScore >= 50 ? 'text-yellow-800 dark:text-yellow-300' : 'text-red-800 dark:text-red-300'}`}>
              🤖 ATS Readiness
            </h4>
            <p className={`text-xs mt-1 ${parsedData.atsScore >= 70 ? 'text-green-700 dark:text-green-400' : parsedData.atsScore >= 50 ? 'text-yellow-700 dark:text-yellow-400' : 'text-red-700 dark:text-red-400'}`}>
              {parsedData.atsScore >= 70 ? 'Resume is well-optimized for ATS systems.' : 
               parsedData.atsScore >= 50 ? 'Good ATS compatibility, minor improvements needed.' : 
               'ATS optimization required. Add keywords and improve formatting.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Skills Radar Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <svg className="w-5 h-5 text-cyan-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Skills Analysis
          </h3>
          <div className="flex justify-center">
            <SkillsRadarChart skills={parsedData.skills} />
          </div>
        </motion.div>

        {/* Comparison Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Current vs Target Scores
          </h3>
          <ComparisonBarChart categories={parsedData.comparisons} />
        </motion.div>
      </div>

      {/* Detailed Analysis Sections */}
      <div className="grid gap-6">
        {parsedData.sections.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                {getSectionIcon(section.title)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {section.title}
                </h3>
                <div className="h-0.5 w-12 bg-gradient-to-r from-blue-500 to-purple-500" />
              </div>
            </div>
            
            <div className="space-y-2">
              {formatContent(section.content)}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
          Progress Summary
        </h3>
        <div className="flex justify-center space-x-8">
          <ProgressRing percentage={parsedData.overallScore} label="Overall Score" color="#3B82F6" />
          <ProgressRing percentage={parsedData.skillsScore} label="Skills Gap" color="#10B981" />
          <ProgressRing percentage={parsedData.atsScore} label="ATS Ready" color="#8B5CF6" />
        </div>
      </motion.div>

      {/* Action Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Action Items & Next Steps
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-red-600 dark:text-red-400 flex items-center">
              <span className="mr-2">🚨</span>
              High Priority
            </h4>
            <ul className="space-y-2">
              {parsedData.skillsScore < 70 && (
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Add missing technical skills from job requirements</span>
                </li>
              )}
              {parsedData.keywordMatchRate < 60 && (
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Incorporate more job-specific keywords throughout resume</span>
                </li>
              )}
              {parsedData.atsScore < 70 && (
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Optimize resume format for ATS compatibility</span>
                </li>
              )}
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-blue-600 dark:text-blue-400 flex items-center">
              <span className="mr-2">💡</span>
              Recommended Improvements
            </h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-sm text-gray-700 dark:text-gray-300">Quantify achievements with specific metrics and numbers</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-sm text-gray-700 dark:text-gray-300">Tailor experience descriptions to match job requirements</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-sm text-gray-700 dark:text-gray-300">Add relevant certifications or training if available</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center">
            <span className="mr-2">🎯</span>
            Goal: Increase Overall Match Score to 85%+
          </h4>
          <p className="text-sm text-green-600 dark:text-green-400">
            Focus on the high-priority items above to significantly improve your resume&apos;s compatibility with this job posting.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}