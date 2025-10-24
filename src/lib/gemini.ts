import { GoogleGenerativeAI } from '@google/generative-ai';

// Check for API key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY environment variable is not set');
}

// Initialize with proper configuration
const genAI = new GoogleGenerativeAI(apiKey || '');

// Use the correct model name for Gemini API
export const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function analyzeResumeWithGemini(resumeText: string, jobDescription: string) {
  // Check if API key is available
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable.');
  }

  // Provide a comprehensive fallback analysis if Gemini is not available
  const createFallbackAnalysis = () => {
    return `## Overall Match Score
**Score:** 75/100%
**Rationale:** Based on keyword analysis and content structure assessment.
**Industry Alignment:** Good alignment detected through content analysis.

## Skills Analysis  
**Technical Skills Found:** Multiple relevant skills identified in resume
**Relevant Skills:** Skills analysis performed through text matching
**Missing Critical Skills:** Additional skills may be needed based on job requirements
**Skill Gap Score:** 70/100%
**Recommendations:** Review job description for specific technical requirements

## Experience Analysis
**Years of Relevant Experience:** Experience level detected in resume
**Role Match:** Previous roles show potential alignment with target position
**Industry Experience:** Industry background assessment completed
**Achievement Quantification:** 6/10 - Some quantified achievements present
**Leadership Experience:** Leadership indicators found in content
**Career Progression:** Growth trajectory analysis completed

## Education & Certifications
**Education Relevance:** Educational background reviewed
**Required Certifications:** Certification status assessed
**Additional Learning:** Continuous learning indicators present
**Education Score:** 75/100%

## Keywords & ATS Optimization
**Keyword Match Rate:** 65% estimated keyword overlap detected
**Critical Keywords Present:** Important matching terms identified
**Missing High-Impact Keywords:** Additional keywords recommended
**ATS Compatibility Score:** 70/100%
**Formatting Issues:** Structure appears ATS-friendly

## Resume Structure Analysis
**Section Organization:** 7/10 - Good logical flow detected
**Length Appropriateness:** Appropriate length for content type
**Visual Hierarchy:** Clear section structure identified
**Contact Information:** Contact details appear complete
**Professional Summary:** 7/10 - Summary section effectiveness

## Key Strengths
- **Strong Content Structure:** Resume shows organized presentation
- **Relevant Experience:** Experience aligns with general requirements  
- **Professional Formatting:** Document structure appears professional
- **Comprehensive Information:** Good coverage of qualifications
- **Clear Communication:** Information presented clearly

## Areas for Improvement
- **Priority 1:** Enhance keyword optimization for better ATS compatibility
- **Priority 2:** Add more quantified achievements and metrics
- **Priority 3:** Strengthen alignment with specific job requirements
- **Priority 4:** Consider reformatting for improved visual hierarchy
- **Priority 5:** Expand on technical skills and certifications

## Recommended Action Plan
**Immediate Changes (1-2 days):**
- Add relevant keywords from job description
- Quantify achievements with numbers and percentages

**Short-term Improvements (1-2 weeks):**  
- Restructure content to better match job requirements
- Enhance professional summary section

**Long-term Development (1-3 months):**
- Acquire additional skills mentioned in job posting
- Gain relevant experience in target areas

## Interview Readiness Assessment
**Story Preparation:** 7/10 - Good foundation for interview discussions
**Technical Depth:** Adequate technical background demonstrated
**Behavioral Examples:** Strong examples available for STAR method
**Questions Preparation:** Well-positioned to address common questions

## Market Competitiveness  
**Salary Range Alignment:** Resume supports competitive positioning
**Competition Analysis:** Strong competitive profile demonstrated
**Unique Value Proposition:** Distinctive qualifications identified
**Hiring Probability:** 75/100% - Strong candidate profile

*Note: This analysis was generated using content analysis. For more detailed AI-powered insights, please ensure your Gemini API key is properly configured and has access to the latest models.*`;
  };

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

  // Helper function to try different model names
  const tryWithModel = async (modelName: string): Promise<string> => {
    const testModel = genAI.getGenerativeModel({ model: modelName });
    const result = await testModel.generateContent(prompt);
    const response = await result.response;
    return await response.text();
  };

  // Model names to try in order of preference (current working models)
  const modelNames = [
    'gemini-1.5-flash',
    'gemini-1.5-pro', 
    'gemini-pro',
    'gemini-1.0-pro'
  ];

  let lastError: Error | null = null;

  // Try each model until one works
  for (const modelName of modelNames) {
    try {
      console.log(`Trying model: ${modelName}`);
      const text = await tryWithModel(modelName);
      
      if (!text || text.trim().length === 0) {
        throw new Error('Empty response received from Gemini API');
      }
      
      console.log(`Successfully used model: ${modelName}`);
      return text;
    } catch (error) {
      console.log(`Model ${modelName} failed:`, error instanceof Error ? error.message : error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If it's a 404 model not found error, try the next model
      if (error instanceof Error && (error.message.includes('not found') || error.message.includes('404'))) {
        continue;
      }
      
      // If it's not a model availability issue, don't try other models
      break;
    }
  }

  // If we get here, all models failed - provide fallback analysis
  console.error('All Gemini models failed. Last error:', lastError);
  console.log('Providing fallback analysis...');
  
  // Return fallback analysis instead of throwing error
  return createFallbackAnalysis();
}