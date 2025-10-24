"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SkillsRadarChart, ComparisonBarChart, ProgressRing } from '@/components/ui/charts';
import { cn } from '@/lib/utils';

interface EnhancedAnalysisDashboardProps {
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
  interviewReadiness: number;
  marketCompetitiveness: number;
  sections: { title: string; content: string; icon: string; color: string }[];
  skills: { skill: string; score: number }[];
  comparisons: { category: string; current: number; target: number }[];
  strengths: string[];
  improvements: string[];
  actionItems: { priority: 'high' | 'medium' | 'low'; item: string; timeline: string }[];
  keyInsights: { type: 'positive' | 'warning' | 'critical'; message: string }[];
}

export function EnhancedAnalysisDashboard({ analysis, className }: EnhancedAnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'actions'>('overview');

  const parseAnalysis = (text: string): ParsedAnalysis => {
    const sections = text.split('##').filter(section => section.trim().length > 0);
    const sectionData = sections.map(section => {
      const lines = section.trim().split('\n');
      const title = lines[0].trim();
      const content = lines.slice(1).join('\n').trim();
      
      // Assign colors and icons based on section type
      let icon = '📋';
      let color = 'blue';
      
      if (title.toLowerCase().includes('score') || title.toLowerCase().includes('match')) {
        icon = '📊'; color = 'blue';
      } else if (title.toLowerCase().includes('skills')) {
        icon = '🎯'; color = 'green';
      } else if (title.toLowerCase().includes('experience')) {
        icon = '💼'; color = 'purple';
      } else if (title.toLowerCase().includes('education')) {
        icon = '🎓'; color = 'indigo';
      } else if (title.toLowerCase().includes('keyword') || title.toLowerCase().includes('ats')) {
        icon = '🔍'; color = 'yellow';
      } else if (title.toLowerCase().includes('strength')) {
        icon = '💪'; color = 'emerald';
      } else if (title.toLowerCase().includes('improvement') || title.toLowerCase().includes('area')) {
        icon = '🚀'; color = 'orange';
      } else if (title.toLowerCase().includes('interview')) {
        icon = '💬'; color = 'cyan';
      } else if (title.toLowerCase().includes('market') || title.toLowerCase().includes('competitive')) {
        icon = '📈'; color = 'pink';
      } else if (title.toLowerCase().includes('plan') || title.toLowerCase().includes('action')) {
        icon = '📅'; color = 'red';
      }
      
      return { title, content, icon, color };
    });

    // Enhanced score extraction with better patterns
    const extractScore = (pattern: RegExp, defaultValue: number = 0): number => {
      const match = text.match(pattern);
      if (match) {
        const scoreText = match[1];
        const numMatch = scoreText.match(/(\d+)/);
        return numMatch ? Math.min(100, Math.max(0, parseInt(numMatch[1]))) : defaultValue;
      }
      return defaultValue;
    };

    // Extract multiple score types
    const overallScore = extractScore(/(?:Overall.*Score|Match.*Score):?\s*[^\d]*(\d+(?:\.\d+)?)[%\/]?/i, 75);
    const skillsScore = extractScore(/(?:Skill.*Gap.*Score|Skills.*Score|Technical.*Skills):?\s*[^\d]*(\d+(?:\.\d+)?)[%\/]?/i, 70);
    const atsScore = extractScore(/(?:ATS.*Score|ATS.*Compatibility):?\s*[^\d]*(\d+(?:\.\d+)?)[%\/]?/i, 70);
    const experienceScore = extractScore(/(?:Experience.*Score|Years.*Experience):?\s*[^\d]*(\d+(?:\.\d+)?)[%\/]?/i, 80);
    const educationScore = extractScore(/(?:Education.*Score):?\s*[^\d]*(\d+(?:\.\d+)?)[%\/]?/i, 85);
    const keywordMatchRate = extractScore(/(?:Keyword.*Match.*Rate):?\s*[^\d]*(\d+(?:\.\d+)?)[%\/]?/i, 65);
    const interviewReadiness = extractScore(/(?:Interview.*Readiness|Story.*Preparation):?\s*[^\d]*(\d+(?:\.\d+)?)[%\/]?/i, 75);
    const marketCompetitiveness = extractScore(/(?:Hiring.*Probability|Market.*Competitive|Competition):?\s*[^\d]*(\d+(?:\.\d+)?)[%\/]?/i, 75);

    // Extract strengths
    const strengthsSection = text.match(/## Key Strengths[\\s\\S]*?(?=##|$)/i);
    const strengths: string[] = [];
    if (strengthsSection) {
      const strengthMatches = strengthsSection[0].match(/- \*\*([^:*]+):\*\*\s*([^\\n]*)/g);
      if (strengthMatches) {
        strengths.push(...strengthMatches.map(match => {
          const parsed = match.match(/- \*\*([^:*]+):\*\*\s*([^\\n]*)/);
          return parsed ? `${parsed[1]}: ${parsed[2]}` : match;
        }));
      }
    }

    // Extract improvements
    const improvementsSection = text.match(/## Areas for Improvement[\\s\\S]*?(?=##|$)/i);
    const improvements: string[] = [];
    if (improvementsSection) {
      const improvementMatches = improvementsSection[0].match(/- \*\*([^:*]+):\*\*\s*([^\\n]*)/g);
      if (improvementMatches) {
        improvements.push(...improvementMatches.map(match => {
          const parsed = match.match(/- \*\*([^:*]+):\*\*\s*([^\\n]*)/);
          return parsed ? `${parsed[1]}: ${parsed[2]}` : match;
        }));
      }
    }

    // Extract action items with priorities
    const actionSection = text.match(/## Recommended Action Plan[\\s\\S]*?(?=##|$)/i);
    const actionItems: { priority: 'high' | 'medium' | 'low'; item: string; timeline: string }[] = [];
    if (actionSection) {
      const immediateMatches = actionSection[0].match(/\*\*Immediate Changes[^:]*:\*\*[\\s\\S]*?(?=\*\*|$)/i);
      const shortTermMatches = actionSection[0].match(/\*\*Short-term[^:]*:\*\*[\\s\\S]*?(?=\*\*|$)/i);
      const longTermMatches = actionSection[0].match(/\*\*Long-term[^:]*:\*\*[\\s\\S]*?(?=\*\*|$)/i);
      
      if (immediateMatches) {
        const items = immediateMatches[0].match(/- ([^\\n]+)/g);
        items?.forEach(item => {
          actionItems.push({
            priority: 'high',
            item: item.replace('- ', ''),
            timeline: '1-2 days'
          });
        });
      }
      
      if (shortTermMatches) {
        const items = shortTermMatches[0].match(/- ([^\\n]+)/g);
        items?.forEach(item => {
          actionItems.push({
            priority: 'medium',
            item: item.replace('- ', ''),
            timeline: '1-2 weeks'
          });
        });
      }
      
      if (longTermMatches) {
        const items = longTermMatches[0].match(/- ([^\\n]+)/g);
        items?.forEach(item => {
          actionItems.push({
            priority: 'low',
            item: item.replace('- ', ''),
            timeline: '1-3 months'
          });
        });
      }
    }

    // Generate key insights based on scores
    const keyInsights: { type: 'positive' | 'warning' | 'critical'; message: string }[] = [];
    
    if (overallScore >= 80) {
      keyInsights.push({
        type: 'positive',
        message: `Excellent overall match! Your resume strongly aligns with the job requirements.`
      });
    } else if (overallScore < 50) {
      keyInsights.push({
        type: 'critical',
        message: `Significant alignment gaps detected. Major improvements needed to match job requirements.`
      });
    }

    if (skillsScore < 60) {
      keyInsights.push({
        type: 'critical',
        message: `Critical skills gap identified. Focus on acquiring key technical skills mentioned in the job posting.`
      });
    }

    if (atsScore < 70) {
      keyInsights.push({
        type: 'warning',
        message: `ATS optimization needed. Your resume may not pass automated screening systems effectively.`
      });
    }

    if (keywordMatchRate < 50) {
      keyInsights.push({
        type: 'warning',
        message: `Low keyword density. Incorporate more job-specific terms from the posting.`
      });
    }

    // Enhanced skills parsing
    const skillMatches = text.match(/\*\*([^:*]+):\*\*\s*([^(]*(?:\\([^)]*\\))?)/g) || [];
    const extractedSkills = skillMatches.slice(0, 8).map((match, index) => {
      const skillMatch = match.match(/\*\*([^:*]+):\*\*\s*([^(]*)/);
      if (skillMatch) {
        const skillName = skillMatch[1].trim();
        const proficiency = skillMatch[2].trim().toLowerCase();
        
        let score = 50;
        if (proficiency.includes('proficient')) score = 85;
        else if (proficiency.includes('familiar')) score = 60;
        else if (proficiency.includes('expert')) score = 95;
        else if (proficiency.includes('beginner')) score = 40;
        else if (proficiency.includes('advanced')) score = 90;
        
        return { skill: skillName, score };
      }
      return { skill: `Skill ${index + 1}`, score: 70 };
    });

    const skills = extractedSkills.length >= 5 ? extractedSkills : [
      { skill: 'Technical Skills', score: skillsScore },
      { skill: 'Experience', score: experienceScore },
      { skill: 'Education', score: educationScore },
      { skill: 'Keywords', score: keywordMatchRate },
      { skill: 'ATS Optimization', score: atsScore },
      { skill: 'Interview Readiness', score: interviewReadiness },
      ...extractedSkills
    ].slice(0, 8);

    // Enhanced comparison data
    const comparisons = [
      { category: 'Overall Match', current: overallScore, target: 90 },
      { category: 'Skills Gap', current: skillsScore, target: 85 },
      { category: 'Keywords', current: keywordMatchRate, target: 80 },
      { category: 'ATS Score', current: atsScore, target: 95 },
      { category: 'Experience', current: experienceScore, target: 85 },
      { category: 'Market Ready', current: marketCompetitiveness, target: 85 }
    ];

    return {
      overallScore,
      skillsScore,
      atsScore,
      experienceScore,
      educationScore,
      keywordMatchRate,
      interviewReadiness,
      marketCompetitiveness,
      sections: sectionData,
      skills,
      comparisons,
      strengths: strengths.length > 0 ? strengths : [
        'Professional experience alignment',
        'Educational background relevance',
        'Clear resume structure',
        'Quantified achievements present',
        'Industry-specific terminology'
      ],
      improvements: improvements.length > 0 ? improvements : [
        'Enhance keyword optimization',
        'Add more quantified metrics',
        'Strengthen skills section',
        'Improve ATS compatibility',
        'Expand technical proficiency details'
      ],
      actionItems,
      keyInsights
    };
  };

  const parsedData = parseAnalysis(analysis);

  const TabButton = ({ id, label, icon }: { id: typeof activeTab; label: string; icon: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        activeTab === id
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
      }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("w-full space-y-8", className)}
    >
      {/* Enhanced Header with Score Summary */}
      <div className="text-center space-y-6">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-700 bg-clip-text text-transparent"
        >
          Resume Analysis Dashboard
        </motion.h2>
        
        {/* Overall Score Hero Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-3xl p-8 border border-blue-200 dark:border-blue-800"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {parsedData.overallScore}%
              </div>
              <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                Overall Match Score
              </div>
              <div className={`text-sm mt-2 px-4 py-2 rounded-full font-medium ${
                parsedData.overallScore >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                parsedData.overallScore >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {parsedData.overallScore >= 80 ? '🎉 Excellent Match!' :
                 parsedData.overallScore >= 60 ? '👍 Good Foundation' :
                 '🔧 Needs Improvement'}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                <div className="text-2xl font-bold text-emerald-600">{parsedData.skillsScore}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Skills Match</div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">{parsedData.atsScore}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">ATS Score</div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                <div className="text-2xl font-bold text-orange-600">{parsedData.keywordMatchRate}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Keywords</div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                <div className="text-2xl font-bold text-cyan-600">{parsedData.marketCompetitiveness}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Market Ready</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Key Insights Section */}
      {parsedData.keyInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid md:grid-cols-3 gap-4"
        >
          {parsedData.keyInsights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-l-4 ${
                insight.type === 'positive' ? 'border-green-400 bg-green-50 dark:bg-green-900/20' :
                insight.type === 'warning' ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' :
                'border-red-400 bg-red-50 dark:bg-red-900/20'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-lg">
                  {insight.type === 'positive' ? '✅' : insight.type === 'warning' ? '⚠️' : '🚨'}
                </span>
                <p className={`text-sm font-medium ${
                  insight.type === 'positive' ? 'text-green-700 dark:text-green-300' :
                  insight.type === 'warning' ? 'text-yellow-700 dark:text-yellow-300' :
                  'text-red-700 dark:text-red-300'
                }`}>
                  {insight.message}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex justify-center"
      >
        <div className="flex space-x-2 p-2 bg-gray-900/50 rounded-xl backdrop-blur-sm">
          <TabButton id="overview" label="Overview" icon="📊" />
          <TabButton id="details" label="Detailed Analysis" icon="🔍" />
          <TabButton id="actions" label="Action Plan" icon="🚀" />
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <span className="mr-2">🎯</span>Skills Analysis
                </h3>
                <div className="flex justify-center">
                  <SkillsRadarChart skills={parsedData.skills} />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <span className="mr-2">📈</span>Current vs Target Scores
                </h3>
                <ComparisonBarChart categories={parsedData.comparisons} />
              </div>
            </div>

            {/* Quick Wins vs Long-term Goals */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/30 dark:to-green-950/30 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800">
                <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-4 flex items-center">
                  <span className="mr-2">💪</span>Key Strengths
                </h3>
                <div className="space-y-3">
                  {parsedData.strengths.slice(0, 4).map((strength, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-emerald-700 dark:text-emerald-300 text-sm font-medium">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-950/30 dark:to-red-950/30 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
                <h3 className="text-lg font-bold text-orange-800 dark:text-orange-300 mb-4 flex items-center">
                  <span className="mr-2">🚀</span>Priority Improvements
                </h3>
                <div className="space-y-3">
                  {parsedData.improvements.slice(0, 4).map((improvement, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-orange-700 dark:text-orange-300 text-sm font-medium">{improvement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="grid gap-6">
            {parsedData.sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-2xl">{section.icon}</span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{section.title}</h3>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">
                    {section.content}
                  </pre>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-8">
            {/* Action Items by Priority */}
            {parsedData.actionItems.length > 0 ? (
              <div className="grid gap-6">
                {/* High Priority */}
                <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
                  <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-4 flex items-center">
                    <span className="mr-2">🚨</span>High Priority (Immediate Action)
                  </h3>
                  <div className="space-y-3">
                    {parsedData.actionItems.filter(item => item.priority === 'high').map((item, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <input type="checkbox" className="mt-1 w-4 h-4 text-red-600" />
                        <div className="flex-1">
                          <p className="text-red-700 dark:text-red-300 font-medium">{item.item}</p>
                          <p className="text-red-600 dark:text-red-400 text-xs mt-1">Timeline: {item.timeline}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medium Priority */}
                <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-800">
                  <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-300 mb-4 flex items-center">
                    <span className="mr-2">⚠️</span>Medium Priority (Short-term)
                  </h3>
                  <div className="space-y-3">
                    {parsedData.actionItems.filter(item => item.priority === 'medium').map((item, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <input type="checkbox" className="mt-1 w-4 h-4 text-yellow-600" />
                        <div className="flex-1">
                          <p className="text-yellow-700 dark:text-yellow-300 font-medium">{item.item}</p>
                          <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-1">Timeline: {item.timeline}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Low Priority */}
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
                    <span className="mr-2">💡</span>Long-term Development
                  </h3>
                  <div className="space-y-3">
                    {parsedData.actionItems.filter(item => item.priority === 'low').map((item, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-blue-700 dark:text-blue-300 font-medium">{item.item}</p>
                          <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">Timeline: {item.timeline}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Default action plan when not parsed
              <div className="grid gap-6">
                <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
                  <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-4 flex items-center">
                    <span className="mr-2">🚨</span>Immediate Actions (1-2 Days)
                  </h3>
                  <div className="space-y-3">
                    {parsedData.skillsScore < 70 && (
                      <div className="flex items-start space-x-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <input type="checkbox" className="mt-1 w-4 h-4 text-red-600" />
                        <p className="text-red-700 dark:text-red-300 font-medium">Add missing technical skills from job requirements</p>
                      </div>
                    )}
                    {parsedData.keywordMatchRate < 60 && (
                      <div className="flex items-start space-x-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <input type="checkbox" className="mt-1 w-4 h-4 text-red-600" />
                        <p className="text-red-700 dark:text-red-300 font-medium">Incorporate job-specific keywords throughout resume</p>
                      </div>
                    )}
                    {parsedData.atsScore < 70 && (
                      <div className="flex items-start space-x-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <input type="checkbox" className="mt-1 w-4 h-4 text-red-600" />
                        <p className="text-red-700 dark:text-red-300 font-medium">Optimize resume format for ATS compatibility</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Progress Tracking */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
              <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300 mb-6 flex items-center">
                <span className="mr-2">📊</span>Progress Tracking
              </h3>
              <div className="flex justify-center space-x-8">
                <ProgressRing percentage={parsedData.overallScore} label="Overall Score" color="#8B5CF6" />
                <ProgressRing percentage={parsedData.skillsScore} label="Skills Gap" color="#10B981" />
                <ProgressRing percentage={parsedData.atsScore} label="ATS Ready" color="#F59E0B" />
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}