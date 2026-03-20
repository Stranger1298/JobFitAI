"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { ImprovementTestResult, ResumeDraft, ResumeTemplateId } from '@/types/pro';

const DRAFT_STORAGE_KEY = 'jobfit-pro-draft';

interface ProResumeWorkspaceProps {
  sourceResumeText: string;
  jobDescription: string;
  baselineScore: number | null;
  testResults: ImprovementTestResult[];
  onSaveTestResult: (result: ImprovementTestResult) => void;
  onRunImprovementTest: (editedResumeText: string) => Promise<number>;
}

interface TemplateMeta {
  id: ResumeTemplateId;
  name: string;
  subtitle: string;
  accent: string;
  previewStyle: string;
}

interface ResumeContactInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
}

const templateMeta: TemplateMeta[] = [
  {
    id: 'classic',
    name: 'Classic Professional',
    subtitle: 'Traditional one-column corporate style',
    accent: 'text-slate-700',
    previewStyle: 'font-[Georgia]'
  },
  {
    id: 'modern',
    name: 'Modern Executive',
    subtitle: 'Two-column modern style with strong hierarchy',
    accent: 'text-rose-700',
    previewStyle: 'font-["Trebuchet_MS"]'
  },
  {
    id: 'compact',
    name: 'Compact Impact',
    subtitle: 'Dense layout ideal for concise resumes',
    accent: 'text-emerald-700',
    previewStyle: 'font-["Verdana"]'
  }
];

const starterTemplateDrafts: Record<ResumeTemplateId, ResumeDraft> = {
  classic: {
    summary:
      'Results-driven professional with 5+ years of experience delivering measurable business outcomes. Proven track record in cross-functional leadership, process improvement, and data-backed decision making.',
    experience:
      'Senior Product Specialist | ABC Tech | 2022 - Present\n- Led cross-functional initiatives that increased feature adoption by 28%.\n- Built operational reporting workflows that reduced turnaround time by 35%.\n\nProduct Specialist | XYZ Solutions | 2019 - 2022\n- Managed roadmap communication across engineering, design, and support teams.\n- Improved customer onboarding completion rate by 22%.',
    skills:
      'Product Strategy, SQL, Dashboarding, Stakeholder Management, Agile Planning, User Research, A/B Testing',
    education:
      'B.Tech in Computer Science\nNational Institute of Technology\n2015 - 2019',
    projects:
      'Growth Analytics Framework\n- Designed KPI models for retention and activation.\n\nWorkflow Automation\n- Automated recurring reports, saving 10+ hours per week.'
  },
  modern: {
    summary:
      'Creative and analytical engineer focused on performance, usability, and scalable system design. Experienced in building polished, high-performing digital products in fast-paced environments.',
    experience:
      'Lead Frontend Engineer | Nova Labs | 2021 - Present\n- Re-architected UI platform, reducing page load time by 40%.\n- Mentored 4 developers and introduced reusable design tokens.\n\nFrontend Engineer | Pixel Forge | 2018 - 2021\n- Built customer dashboards used by 10k+ monthly active users.\n- Improved accessibility compliance across core product journeys.',
    skills:
      'React, TypeScript, Next.js, Design Systems, Performance Optimization, Accessibility (WCAG), Testing (Jest/RTL)',
    education:
      'B.Sc. Information Technology\nUniversity of Mumbai\n2014 - 2018',
    projects:
      'Design System Kit\n- Created reusable component library for 3 product teams.\n\nRealtime Insights Panel\n- Implemented live data dashboard modules with alerts.'
  },
  compact: {
    summary:
      'Focused operations professional with practical execution skills and a strong ability to simplify complex workflows into measurable, repeatable outcomes.',
    experience:
      'Operations Analyst | Orbit Systems | 2020 - Present\n- Improved SLA compliance by 19% through process redesign.\n- Built self-serve reporting for internal teams.\n\nAnalyst Intern | DataCore | 2019 - 2020\n- Supported data quality and visualization projects.',
    skills:
      'Excel, SQL, Process Mapping, KPI Tracking, Documentation, Stakeholder Communication',
    education:
      'BBA\nDelhi University\n2016 - 2019',
    projects:
      'SLA Monitoring Dashboard\n- Built dashboards for incident and resolution tracking.\n\nWorkflow Audit\n- Documented and optimized recurring operations.'
  }
};

function extractSection(text: string, headingCandidates: string[]): string {
  const lines = text.split(/\r?\n/);
  const normalizedCandidates = headingCandidates.map((candidate) => candidate.toLowerCase());

  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    const normalized = lines[i].trim().toLowerCase().replace(/:$/, '');
    if (normalizedCandidates.includes(normalized)) {
      start = i + 1;
      break;
    }
  }

  if (start === -1) return '';

  const collected: string[] = [];
  for (let i = start; i < lines.length; i++) {
    const line = lines[i].trim();
    const isHeading =
      line.length > 0 &&
      line.length < 40 &&
      /^[A-Za-z][A-Za-z\s&/-]+:?$/.test(line) &&
      !line.startsWith('-') &&
      !line.startsWith('*');

    if (isHeading) break;
    collected.push(lines[i]);
  }

  return collected.join('\n').trim();
}

function normalizeSectionText(value: string, maxChars = 1400): string {
  const cleaned = value
    .replace(/\r/g, '')
    .replace(/\t/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (cleaned.length <= maxChars) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxChars).trim()}\n- Additional details available in full resume`;
}

function toBulletedLines(text: string): string {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return '';
  const needsBullets = lines.length > 1 && lines.every((line) => !line.startsWith('-'));
  if (!needsBullets) return lines.join('\n');
  return lines.map((line) => `- ${line}`).join('\n');
}

function extractContactInfo(text: string): ResumeContactInfo {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(/(?:\+?\d[\d\s\-()]{8,}\d)/);

  const firstLikelyName = lines.find((line) => {
    if (line.length < 3 || line.length > 60) return false;
    if (line.includes('@') || /\d{3,}/.test(line)) return false;
    const wordCount = line.split(/\s+/).length;
    return wordCount >= 2 && wordCount <= 5;
  });

  const locationLine = lines.find((line) => {
    if (line === firstLikelyName) return false;
    if (line.includes('@') || /(?:\+?\d[\d\s\-()]{8,}\d)/.test(line)) return false;
    if (line.length < 4 || line.length > 40) return false;
    return /[A-Za-z]/.test(line);
  });

  return {
    name: firstLikelyName || 'Your Name',
    email: emailMatch?.[0] || 'your.email@example.com',
    phone: phoneMatch?.[0] || '+91 90000 00000',
    location: locationLine || 'City, Country'
  };
}

function createDraftFromResumeText(text: string): ResumeDraft {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      summary: '',
      experience: '',
      skills: '',
      education: '',
      projects: ''
    };
  }

  const summary =
    extractSection(trimmed, ['summary', 'professional summary', 'profile']) ||
    trimmed.split(/\n\n/).slice(0, 2).join('\n\n');

  const experience = extractSection(trimmed, ['experience', 'work experience', 'employment history']);
  const skills = extractSection(trimmed, ['skills', 'technical skills', 'core skills']);
  const education = extractSection(trimmed, ['education', 'academic background']);
  const projects = extractSection(trimmed, ['projects', 'project experience']);

  const fallbackChunks = trimmed.split(/\n\n+/).map((chunk) => chunk.trim()).filter(Boolean);

  return {
    summary:
      normalizeSectionText(summary, 900),
    experience: normalizeSectionText(
      toBulletedLines(experience || fallbackChunks.slice(1, 3).join('\n\n')),
      1800
    ),
    skills: normalizeSectionText(
      skills || fallbackChunks.find((chunk) => /skills?|technologies|tools/i.test(chunk)) || '',
      800
    ),
    education: normalizeSectionText(
      education || fallbackChunks.find((chunk) => /education|university|college|b\.|m\./i.test(chunk)) || '',
      700
    ),
    projects: normalizeSectionText(
      toBulletedLines(projects || fallbackChunks.find((chunk) => /project/i.test(chunk)) || ''),
      1200
    )
  };
}

function buildResumeText(draft: ResumeDraft): string {
  return [
    'Summary',
    draft.summary,
    '',
    'Experience',
    draft.experience,
    '',
    'Skills',
    draft.skills,
    '',
    'Education',
    draft.education,
    '',
    'Projects',
    draft.projects
  ]
    .join('\n')
    .trim();
}

function ResumeSection({ title, content }: { title: string; content: string }) {
  return (
    <div className="mb-5 last:mb-0">
      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600 mb-2">{title}</h4>
      <div className="text-[13px] leading-[1.6] whitespace-pre-wrap text-slate-800">
        {normalizeSectionText(content || 'No content yet.', 1200)}
      </div>
    </div>
  );
}

function ResumeHeader({ accentClass, contact }: { accentClass: string; contact: ResumeContactInfo }) {
  return (
    <div className="mb-6 pb-4 border-b border-slate-200">
      <h2 className={`text-[26px] font-bold tracking-tight ${accentClass}`}>{contact.name}</h2>
      <p className="text-[12px] text-slate-500 mt-1">
        {contact.email} | {contact.phone} | {contact.location}
      </p>
    </div>
  );
}

function ClassicPreview({ draft, contact }: { draft: ResumeDraft; contact: ResumeContactInfo }) {
  return (
    <div>
      <ResumeHeader accentClass="text-slate-800" contact={contact} />
      <ResumeSection title="Summary" content={draft.summary} />
      <ResumeSection title="Experience" content={draft.experience} />
      <ResumeSection title="Skills" content={draft.skills} />
      <ResumeSection title="Education" content={draft.education} />
      <ResumeSection title="Projects" content={draft.projects} />
    </div>
  );
}

function ModernPreview({ draft, contact }: { draft: ResumeDraft; contact: ResumeContactInfo }) {
  return (
    <div>
      <ResumeHeader accentClass="text-rose-700" contact={contact} />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 border-r border-slate-200 pr-5">
          <ResumeSection title="Professional Summary" content={draft.summary} />
          <ResumeSection title="Experience" content={draft.experience} />
          <ResumeSection title="Projects" content={draft.projects} />
        </div>
        <div className="col-span-1">
          <ResumeSection title="Core Skills" content={draft.skills} />
          <ResumeSection title="Education" content={draft.education} />
        </div>
      </div>
    </div>
  );
}

function CompactPreview({ draft, contact }: { draft: ResumeDraft; contact: ResumeContactInfo }) {
  return (
    <div>
      <ResumeHeader accentClass="text-emerald-700" contact={contact} />
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3">
            <ResumeSection title="Summary" content={draft.summary} />
            <ResumeSection title="Experience" content={draft.experience} />
          </div>
          <div className="col-span-2">
            <ResumeSection title="Skills" content={draft.skills} />
            <ResumeSection title="Education" content={draft.education} />
          </div>
        </div>
        <ResumeSection title="Projects" content={draft.projects} />
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  selected,
  onSelect
}: {
  template: TemplateMeta;
  selected: boolean;
  onSelect: (id: ResumeTemplateId) => void;
}) {
  return (
    <button
      onClick={() => onSelect(template.id)}
      className={`text-left rounded-xl border p-4 transition-all ${
        selected
          ? 'border-red-500 bg-red-500/10 shadow-[0_0_0_1px_rgba(239,68,68,0.4)]'
          : 'border-zinc-700 bg-zinc-900/70 hover:border-zinc-500'
      }`}
    >
      <p className={`text-sm font-semibold ${selected ? 'text-white' : 'text-zinc-200'}`}>{template.name}</p>
      <p className="text-xs text-zinc-400 mt-1">{template.subtitle}</p>
      <div className="mt-3 rounded-md border border-zinc-700 bg-zinc-950 p-2">
        <div className="h-1.5 w-24 rounded bg-zinc-600 mb-2" />
        <div className="space-y-1">
          <div className="h-1.5 w-full rounded bg-zinc-700" />
          <div className="h-1.5 w-4/5 rounded bg-zinc-700" />
          <div className="h-1.5 w-5/6 rounded bg-zinc-700" />
        </div>
      </div>
    </button>
  );
}

export function ProResumeWorkspace({
  sourceResumeText,
  jobDescription,
  baselineScore,
  testResults,
  onSaveTestResult,
  onRunImprovementTest
}: ProResumeWorkspaceProps) {
  const [draft, setDraft] = useState<ResumeDraft>(() => createDraftFromResumeText(sourceResumeText));
  const [templateId, setTemplateId] = useState<ResumeTemplateId>('classic');
  const [rewritingSection, setRewritingSection] = useState<keyof ResumeDraft | null>(null);
  const [testing, setTesting] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [exportingPdf, setExportingPdf] = useState(false);
  const [rewriteError, setRewriteError] = useState<string | null>(null);
  const [rewriteSuccess, setRewriteSuccess] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ResumeDraft;
        if (parsed && typeof parsed === 'object') {
          setDraft(parsed);
          return;
        }
      } catch {
        // Ignore parse issues and fall back to source text
      }
    }

    setDraft(createDraftFromResumeText(sourceResumeText));
  }, [sourceResumeText]);

  useEffect(() => {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  const resumeText = useMemo(() => buildResumeText(draft), [draft]);
  const contactInfo = useMemo(() => extractContactInfo(sourceResumeText), [sourceResumeText]);

  const currentTemplate = templateMeta.find((t) => t.id === templateId) || templateMeta[0];

  const handleFieldChange = (field: keyof ResumeDraft, value: string) => {
    setRewriteError(null);
    setRewriteSuccess(null);
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyTemplate = () => {
    setDraft(starterTemplateDrafts[templateId]);
  };

  const handleRewrite = async (field: keyof ResumeDraft) => {
    setRewriteError(null);
    setRewriteSuccess(null);

    if (!draft[field].trim()) {
      setRewriteError(`Please add some ${field} content before rewriting.`);
      return;
    }

    if (!jobDescription.trim()) {
      setRewriteError('Job description is missing. Run analysis again with a job description to enable AI rewrite.');
      return;
    }

    try {
      setRewritingSection(field);
      const response = await fetch('/api/pro/rewrite-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: field,
          content: draft[field],
          jobDescription
        })
      });

      const data = await response.json();
      if (!response.ok || !data?.rewritten) {
        if (response.status === 403) {
          throw new Error('Pro access is required. Please unlock Pro or enable dev Pro access.');
        }
        throw new Error(data?.error || 'Failed to rewrite section.');
      }

      handleFieldChange(field, data.rewritten);
      setRewriteSuccess(`${field.charAt(0).toUpperCase() + field.slice(1)} rewritten successfully.`);
    } catch (error) {
      console.error(error);
      setRewriteError(error instanceof Error ? error.message : 'AI rewrite failed. Please try again.');
    } finally {
      setRewritingSection(null);
    }
  };

  const handleExportTxt = () => {
    const blob = new Blob([resumeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `edited-resume-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = async () => {
    try {
      setExportingPdf(true);
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 46;
      const usableWidth = pageWidth - margin * 2;
      let y = margin;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.text('Your Name', margin, y);
      y += 16;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(90);
      pdf.text('your.email@example.com | +91 90000 00000 | city, country', margin, y);
      y += 18;

      const drawDivider = () => {
        pdf.setDrawColor(220);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 16;
      };

      drawDivider();

      const drawHeading = (heading: string) => {
        if (y > pageHeight - 80) {
          pdf.addPage();
          y = margin;
        }
        pdf.setTextColor(35);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text(heading.toUpperCase(), margin, y);
        y += 16;
      };

      const drawBody = (body: string) => {
        pdf.setTextColor(55);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10.5);
        const paragraphs = body.split('\n');
        for (const paragraph of paragraphs) {
          const line = paragraph.trim().length ? paragraph : ' ';
          const wrapped = pdf.splitTextToSize(line, usableWidth) as string[];
          for (const wrappedLine of wrapped) {
            if (y > pageHeight - 48) {
              pdf.addPage();
              y = margin;
            }
            pdf.text(wrappedLine, margin, y);
            y += 13.5;
          }
        }
        y += 10;
      };

      drawHeading('Summary');
      drawBody(draft.summary);
      drawHeading('Experience');
      drawBody(draft.experience);
      drawHeading('Skills');
      drawBody(draft.skills);
      drawHeading('Education');
      drawBody(draft.education);
      drawHeading('Projects');
      drawBody(draft.projects);

      pdf.save(`resume-${templateId}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setExportingPdf(false);
    }
  };

  const handleRunTest = async () => {
    if (baselineScore === null) return;

    try {
      setTesting(true);
      const newScore = await onRunImprovementTest(resumeText);
      onSaveTestResult({
        baselineScore,
        newScore,
        delta: newScore - baselineScore,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Improvement test failed:', error);
    } finally {
      setTesting(false);
    }
  };

  const fields: Array<{ key: keyof ResumeDraft; label: string; rows: number }> = [
    { key: 'summary', label: 'Summary', rows: 5 },
    { key: 'experience', label: 'Experience', rows: 8 },
    { key: 'skills', label: 'Skills', rows: 5 },
    { key: 'education', label: 'Education', rows: 4 },
    { key: 'projects', label: 'Projects', rows: 5 }
  ];

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-white tracking-tight">Pro Resume Builder & Templates</h3>
          <p className="text-sm text-zinc-400 mt-1">
            Choose a professional template, refine content with AI, preview on resume paper, and export polished output.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleApplyTemplate}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:text-white"
          >
            Apply Template Content
          </button>
          <button
            onClick={() => setViewMode((prev) => (prev === 'edit' ? 'preview' : 'edit'))}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:text-white"
          >
            {viewMode === 'edit' ? 'Open Professional Preview' : 'Back to Edit'}
          </button>
          <button
            onClick={handleExportTxt}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:text-white"
          >
            Export TXT
          </button>
          <button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:text-white disabled:opacity-60"
          >
            {exportingPdf ? 'Generating PDF...' : 'Download PDF'}
          </button>
          <button
            onClick={handleRunTest}
            disabled={baselineScore === null || testing}
            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {testing ? 'Testing...' : 'Test Improvement'}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {templateMeta.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            selected={template.id === templateId}
            onSelect={setTemplateId}
          />
        ))}
      </div>

      {viewMode === 'edit' ? (
        <div className="rounded-xl border border-zinc-700 bg-zinc-950/70 p-4">
          <div className={`text-xs uppercase tracking-[0.2em] mb-4 ${currentTemplate.accent}`}>
            Editing in {currentTemplate.name}
          </div>
          {rewriteError && (
            <div className="mb-4 rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-sm text-red-300">
              {rewriteError}
            </div>
          )}
          {rewriteSuccess && (
            <div className="mb-4 rounded-lg border border-green-500/40 bg-green-950/30 px-3 py-2 text-sm text-green-300">
              {rewriteSuccess}
            </div>
          )}
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.key}>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-200">{field.label}</label>
                  <button
                    onClick={() => handleRewrite(field.key)}
                    disabled={rewritingSection === field.key || !draft[field.key].trim()}
                    className="text-xs rounded-md border border-zinc-700 px-2 py-1 text-zinc-300 hover:text-white disabled:opacity-50"
                  >
                    {rewritingSection === field.key ? 'Rewriting...' : 'AI Rewrite'}
                  </button>
                </div>
                <textarea
                  value={draft[field.key]}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  rows={field.rows}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm text-zinc-200 focus:border-red-500 focus:outline-none"
                  placeholder={`Add ${field.label.toLowerCase()} details...`}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-700 bg-zinc-950/70 p-5">
          <div className="overflow-auto">
            <div className={`mx-auto w-[820px] min-h-[1080px] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.25)] border border-zinc-200 p-10 ${currentTemplate.previewStyle}`}>
              {templateId === 'classic' && <ClassicPreview draft={draft} contact={contactInfo} />}
              {templateId === 'modern' && <ModernPreview draft={draft} contact={contactInfo} />}
              {templateId === 'compact' && <CompactPreview draft={draft} contact={contactInfo} />}
            </div>
          </div>
        </div>
      )}

      {testResults.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4">
          <h4 className="text-sm font-semibold text-white mb-3">Improvement Test Results</h4>
          <div className="space-y-2">
            {testResults
              .slice()
              .reverse()
              .map((result, idx) => (
                <div
                  key={`${result.timestamp}-${idx}`}
                  className="flex items-center justify-between text-sm border-b border-zinc-800 pb-2"
                >
                  <div className="text-zinc-400">{new Date(result.timestamp).toLocaleString()}</div>
                  <div className="text-zinc-200">
                    {result.baselineScore}% {'->'} {result.newScore}%
                  </div>
                  <div className={result.delta >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {result.delta >= 0 ? '+' : ''}
                    {result.delta}%
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </section>
  );
}
