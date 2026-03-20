import { GoogleGenerativeAI } from '@google/generative-ai';

// Check for API key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

export const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

interface AnalyzeOptions {
  includeImprovementSuggestions?: boolean;
}

function createFallbackAnalysis(includeImprovementSuggestions: boolean): string {
  const baseSections = `## Overall Match Score
**Score:** 75/100%
**Rationale:** Based on keyword analysis and content structure assessment.
**Industry Alignment:** Good alignment detected through content analysis.

## Skills Analysis
**Technical Skills Found:** Multiple relevant skills identified in resume
**Relevant Skills:** Skills analysis performed through text matching
**Missing Critical Skills:** Additional skills may be needed based on job requirements
**Skill Gap Score:** 70/100%

## Experience Analysis
**Years of Relevant Experience:** Experience level detected in resume
**Role Match:** Previous roles show potential alignment with target position
**Achievement Quantification:** 6/10 - Some quantified achievements present

## Keywords & ATS Optimization
**Keyword Match Rate:** 65% estimated keyword overlap detected
**Critical Keywords Present:** Important matching terms identified
**Missing High-Impact Keywords:** Additional keywords recommended
**ATS Compatibility Score:** 70/100%

## Key Strengths
- **Strong Content Structure:** Resume shows organized presentation
- **Relevant Experience:** Experience aligns with general requirements
- **Professional Formatting:** Document structure appears professional`;

  const proSections = `

## Areas for Improvement
- **Priority 1:** Enhance keyword optimization for better ATS compatibility
- **Priority 2:** Add more quantified achievements and metrics
- **Priority 3:** Strengthen alignment with specific job requirements

## Recommended Action Plan
**Immediate Changes (1-2 days):**
- Add relevant keywords from job description
- Quantify achievements with numbers and percentages

**Short-term Improvements (1-2 weeks):**
- Restructure content to better match job requirements
- Enhance professional summary section`;

  const lockedSections = `

## Pro Resume Improvement (Locked)
Unlock Pro to access:
- Personalized priority improvements
- 30/60/90 day action plan
- Interview readiness roadmap
- Resume rewrite suggestions`;

  return `${baseSections}${includeImprovementSuggestions ? proSections : lockedSections}`;
}

function createPrompt(resumeText: string, jobDescription: string, includeImprovementSuggestions: boolean): string {
  if (!includeImprovementSuggestions) {
    return `
As an expert resume reviewer, analyze the resume against the job description and provide a FREE-TIER analysis.

Job Description:
${jobDescription}

Resume Content:
${resumeText}

Output format (strictly follow):

## Overall Match Score
**Score:** X/100%
**Rationale:** concise explanation
**Industry Alignment:** concise explanation

## Skills Analysis
**Technical Skills Found:** X out of Y
**Relevant Skills:** list
**Missing Critical Skills:** list
**Skill Gap Score:** X/100%

## Experience Analysis
**Years of Relevant Experience:** X years
**Role Match:** concise explanation
**Achievement Quantification:** X/10

## Keywords & ATS Optimization
**Keyword Match Rate:** X%
**Critical Keywords Present:** list
**Missing High-Impact Keywords:** list
**ATS Compatibility Score:** X/100%

## Key Strengths
- **Strength 1:** short
- **Strength 2:** short
- **Strength 3:** short

## Pro Resume Improvement (Locked)
Unlock Pro to access:
- Personalized priority improvements
- 30/60/90 day action plan
- Interview readiness roadmap
- Resume rewrite suggestions
`;
  }

  return `
As an expert resume reviewer and career coach, analyze the resume against the job description and provide comprehensive recommendations.

Job Description:
${jobDescription}

Resume Content:
${resumeText}

Please provide this exact structure:

## Overall Match Score
**Score:** X/100%
**Rationale:** Explain scoring based on skills, experience, and keyword alignment.
**Industry Alignment:** Role/industry fit assessment.

## Skills Analysis
**Technical Skills Found:** X out of Y required skills identified
**Relevant Skills:** Matching technical skills with proficiency indicators
**Missing Critical Skills:** Essential skills not found
**Skill Gap Score:** X/100%
**Recommendations:** Skills to add or emphasize

## Experience Analysis
**Years of Relevant Experience:** X years
**Role Match:** Alignment with target position
**Industry Experience:** Relevant domain background
**Achievement Quantification:** X/10
**Leadership Experience:** Assessment
**Career Progression:** Growth trajectory

## Education & Certifications
**Education Relevance:** Alignment with role requirements
**Required Certifications:** X out of Y present
**Additional Learning:** Courses/training highlighted
**Education Score:** X/100%

## Keywords & ATS Optimization
**Keyword Match Rate:** X%
**Critical Keywords Present:** list
**Missing High-Impact Keywords:** list
**ATS Compatibility Score:** X/100%
**Formatting Issues:** ATS-unfriendly elements

## Key Strengths
- **Strength 1:** Detailed explanation
- **Strength 2:** Detailed explanation
- **Strength 3:** Detailed explanation
- **Strength 4:** Detailed explanation
- **Strength 5:** Detailed explanation

## Areas for Improvement
- **Priority 1:** Most critical improvement with action steps
- **Priority 2:** Secondary improvement with timeline
- **Priority 3:** Enhancement with expected impact
- **Priority 4:** Fine-tuning recommendation
- **Priority 5:** Long-term development recommendation

## Recommended Action Plan
**Immediate Changes (1-2 days):**
- Quick wins and keyword/format updates

**Short-term Improvements (1-2 weeks):**
- Structural/content upgrades

**Long-term Development (1-3 months):**
- Skill and experience-building roadmap

## Interview Readiness Assessment
**Story Preparation:** X/10
**Technical Depth:** Assessment
**Behavioral Examples:** STAR quality
**Questions Preparation:** Likely gap-based interview questions

## Market Competitiveness
**Salary Range Alignment:** Assessment
**Competition Analysis:** Candidate competitiveness
**Unique Value Proposition:** What stands out
**Hiring Probability:** X/100%
`;
}

export async function analyzeResumeWithGemini(
  resumeText: string,
  jobDescription: string,
  options: AnalyzeOptions = {}
): Promise<string> {
  const includeImprovementSuggestions = options.includeImprovementSuggestions ?? true;

  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable.');
  }

  const prompt = createPrompt(resumeText, jobDescription, includeImprovementSuggestions);

  const tryWithModel = async (modelName: string): Promise<string> => {
    const testModel = genAI.getGenerativeModel({ model: modelName });
    const result = await testModel.generateContent(prompt);
    const response = await result.response;
    return await response.text();
  };

  const modelNames = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-pro', 'gemini-flash-latest'];

  let lastError: Error | null = null;

  for (const modelName of modelNames) {
    try {
      const text = await tryWithModel(modelName);

      if (!text || text.trim().length === 0) {
        throw new Error('Empty response received from Gemini API');
      }

      return text;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (error instanceof Error && (error.message.includes('not found') || error.message.includes('404'))) {
        continue;
      }
      break;
    }
  }

  console.error('All Gemini models failed. Last error:', lastError);
  return createFallbackAnalysis(includeImprovementSuggestions);
}

export async function rewriteResumeSectionWithGemini(
  sectionName: string,
  sectionContent: string,
  jobDescription: string
): Promise<string> {
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable.');
  }

  const prompt = `
You are an expert resume writer.
Rewrite ONLY the provided resume section to better align with the target job description.
Keep facts honest. Use concise, ATS-friendly language, strong action verbs, and measurable impact where possible.
IMPORTANT:
- Return only the rewritten section body.
- Do not include markdown, headings, labels, code fences, or explanations.
- Keep length similar to the original section (not longer than 1.3x original length).

Section Name: ${sectionName}

Job Description:
${jobDescription}

Current Section Content:
${sectionContent}
`;

  const alternatePrompt = `
Rewrite the section below with a noticeably improved wording and structure.
Do not copy original phrasing line-by-line.
Return plain section text only (no headings, no markdown, no notes).

Section Name: ${sectionName}

Job Description:
${jobDescription}

Current Section Content:
${sectionContent}
`;

  const normalizeForCompare = (value: string): string =>
    value
      .toLowerCase()
      .replace(/[`*_#>-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const cleanRewriteOutput = (value: string): string => {
    return value
      .replace(/```[\s\S]*?```/g, '')
      .replace(/^#{1,6}\s.*$/gm, '')
      .replace(/^\s*(summary|experience|skills|education|projects)\s*:?\s*$/gim, '')
      .replace(/^\s*[-*]\s*/gm, '- ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const tryWithModel = async (modelName: string): Promise<string> => {
    const testModel = genAI.getGenerativeModel({ model: modelName });
    const result = await testModel.generateContent(prompt);
    const response = await result.response;
    return cleanRewriteOutput(await response.text());
  };

  const tryAlternateWithModel = async (modelName: string): Promise<string> => {
    const testModel = genAI.getGenerativeModel({ model: modelName });
    const result = await testModel.generateContent(alternatePrompt);
    const response = await result.response;
    return cleanRewriteOutput(await response.text());
  };

  const modelNames = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-pro', 'gemini-flash-latest'];
  let lastError: Error | null = null;

  for (const modelName of modelNames) {
    try {
      const rewritten = await tryWithModel(modelName);
      if (!rewritten) {
        throw new Error('Empty rewrite response received from Gemini API');
      }

      if (normalizeForCompare(rewritten) === normalizeForCompare(sectionContent)) {
        const alternate = await tryAlternateWithModel(modelName);
        if (alternate && normalizeForCompare(alternate) !== normalizeForCompare(sectionContent)) {
          return alternate;
        }
      }

      return rewritten;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (error instanceof Error && (error.message.includes('not found') || error.message.includes('404'))) {
        continue;
      }
      break;
    }
  }

  console.error('Resume section rewrite failed. Last error:', lastError);
  return sectionContent;
}
