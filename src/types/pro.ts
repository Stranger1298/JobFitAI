export type ResumeTemplateId = 'classic' | 'modern' | 'compact';

export interface ResumeDraft {
  summary: string;
  experience: string;
  skills: string;
  education: string;
  projects: string;
}

export interface ImprovementTestResult {
  baselineScore: number;
  newScore: number;
  delta: number;
  timestamp: string;
}
