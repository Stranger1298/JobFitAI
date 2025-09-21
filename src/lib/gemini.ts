import { GoogleGenerativeAI } from '@google/generative-ai';

// Check for API key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

export const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function analyzeResumeWithGemini(resumeText: string, jobDescription: string) {
  // Check if API key is available
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable.');
  }

  const prompt = `
As an expert resume reviewer and career coach, analyze the following resume against the provided job description and provide detailed feedback with comprehensive statistics.

**Job Description:**
${jobDescription}

**Resume Content:**
${resumeText}

Please provide a comprehensive analysis in the following format:

## Overall Match Score
**Score:** X/100%
**Rationale:** Explain the scoring breakdown based on skills match, experience relevance, and keyword alignment.
**Industry Alignment:** Rate how well the resume fits the target industry/role.

## Skills Analysis
**Technical Skills Found:** X out of Y required skills identified
**Relevant Skills:** List all matching technical skills with proficiency indicators
**Missing Critical Skills:** List essential skills not found in resume
**Skill Gap Score:** X/100% (percentage of required skills present)
**Recommendations:** Specific skills to add or emphasize

## Experience Analysis
**Years of Relevant Experience:** X years
**Role Match:** How well previous roles align with target position
**Industry Experience:** Relevant industry background assessment
**Achievement Quantification:** Rate how well accomplishments are quantified (X/10)
**Leadership Experience:** Assessment of management/leadership roles
**Career Progression:** Analysis of growth trajectory

## Education & Certifications
**Education Relevance:** How well education matches job requirements
**Required Certifications:** X out of Y certifications present
**Additional Learning:** Relevant courses, training, or self-learning mentioned
**Education Score:** X/100%

## Keywords & ATS Optimization
**Keyword Match Rate:** X% of job description keywords found in resume
**Critical Keywords Present:** List of important matching keywords
**Missing High-Impact Keywords:** Priority keywords to add
**ATS Compatibility Score:** X/100%
**Formatting Issues:** Specific ATS-unfriendly elements identified

## Resume Structure Analysis
**Section Organization:** Rate the logical flow and structure (X/10)
**Length Appropriateness:** Assessment of resume length for experience level
**Visual Hierarchy:** Clarity of headings and information presentation
**Contact Information:** Completeness and professionalism assessment
**Professional Summary:** Effectiveness rating (X/10)

## Key Strengths
- **Strength 1:** Detailed explanation with specific examples
- **Strength 2:** How this aligns with job requirements
- **Strength 3:** Impact on hiring decision
- **Strength 4:** Competitive advantage this provides
- **Strength 5:** Market value of this strength

## Areas for Improvement
- **Priority 1:** Most critical improvement needed with specific action steps
- **Priority 2:** Secondary improvement with implementation timeline
- **Priority 3:** Enhancement opportunity with expected impact
- **Priority 4:** Fine-tuning suggestion for better presentation
- **Priority 5:** Long-term development recommendation

## Recommended Action Plan
**Immediate Changes (1-2 days):**
- Specific formatting or keyword additions
- Quick content modifications

**Short-term Improvements (1-2 weeks):**
- Content restructuring recommendations
- Skill emphasis adjustments

**Long-term Development (1-3 months):**
- Skill acquisition suggestions
- Experience building recommendations

## Interview Readiness Assessment
**Story Preparation:** Rate readiness to discuss key achievements (X/10)
**Technical Depth:** Ability to discuss technical skills in detail
**Behavioral Examples:** Strength of STAR method examples available
**Questions Preparation:** Likely interview questions based on resume gaps

## Market Competitiveness
**Salary Range Alignment:** How resume supports target salary expectations
**Competition Analysis:** How this resume compares to typical candidates
**Unique Value Proposition:** What sets this candidate apart
**Hiring Probability:** Estimated likelihood of getting interview (X/100%)

Please be specific, provide quantitative assessments where possible, and include actionable advice with clear timelines for implementation.
  `;

  try {
    const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = await response.text();
    
    if (!text || text.trim().length === 0) {
      throw new Error('Empty response received from Gemini API');
    }
    
    return text;
  } catch (error) {
    console.error('Error analyzing resume with Gemini:', error);
    
    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes('API key')) {
        throw new Error('Invalid or missing Gemini API key. Please check your API key configuration.');
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        throw new Error('API quota exceeded. Please try again later or check your Gemini API billing.');
      } else if (error.message.includes('permission') || error.message.includes('forbidden')) {
        throw new Error('API access denied. Please check your Gemini API key permissions.');
      } else {
        throw new Error(`Gemini API error: ${error.message}`);
      }
    }
    
    throw new Error('Failed to analyze resume. Please try again.');
  }
}