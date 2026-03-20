import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { analyzeResumeWithGemini } from '@/lib/gemini';
import { hasProAccess } from '@/lib/payment-access';

// Dynamic import for pdf-parse to avoid build issues
async function extractPDFText(buffer: Buffer): Promise<string> {
  try {
    // Import the implementation directly to avoid pdf-parse's index.js test runner
    const pdfParseModule = await import('pdf-parse/lib/pdf-parse.js');
    // The module is declared in src/types/pdf-parse-impl.d.ts
    const pdfParse = (pdfParseModule && (pdfParseModule.default || pdfParseModule)) as (data: Buffer) => Promise<{ text: string }>;
    const data = await pdfParse(buffer);

    // Clean up parsed text for better readability and AI comprehension
    let text = data.text;
    text = text.replace(/-\n/g, ''); // Fix hyphenated line breaks
    text = text.replace(/\n\s*\n\s*\n/g, '\n\n'); // Normalize excessive newlines
    return text.trim();
  } catch (error) {
    console.error('Error with PDF extraction:', error);
    throw new Error('PDF extraction failed. Please try converting to TXT or DOCX format.');
  }
}

async function extractTextFromBuffer(buffer: Buffer, fileType: string, fileName: string): Promise<string> {
  const lowerFileName = fileName.toLowerCase();

  if (fileType === 'application/pdf' || lowerFileName.endsWith('.pdf')) {
    return await extractPDFText(buffer);
  } else if (fileType === 'text/plain' || lowerFileName.endsWith('.txt')) {
    return buffer.toString('utf-8');
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileType === 'application/msword' ||
    lowerFileName.endsWith('.docx') ||
    lowerFileName.endsWith('.doc')
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else {
    throw new Error('Unsupported file type. Please upload PDF, TXT, DOC, or DOCX files.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const userHasProAccess = hasProAccess(request);
    const formData = await request.formData();
    const resumeValue = formData.get('resume');
    const resumeFile = resumeValue instanceof File ? resumeValue : null;
    const resumeTextInput = String(formData.get('resumeText') || '').trim();
    const jdFileValue = formData.get('jobDescriptionFile');
    const jobDescriptionFile = jdFileValue instanceof File ? jdFileValue : null;
    const jobDescriptionText = formData.get('jobDescription') as string;
    const requestedMode = String(formData.get('analysisMode') || 'free').toLowerCase();
    const includeImprovementSuggestions = requestedMode === 'pro' && userHasProAccess;

    if (!resumeFile && !resumeTextInput) {
      return NextResponse.json({ error: 'Please upload a resume file or provide resume text.' }, { status: 400 });
    }

    // Validate that we have either job description text or file
    if (!jobDescriptionText?.trim() && !jobDescriptionFile) {
      return NextResponse.json({
        error: 'Please provide a job description either as text or upload a file'
      }, { status: 400 });
    }

    let resumeText = '';

    if (resumeTextInput) {
      resumeText = resumeTextInput;
    } else if (resumeFile) {
      const resumeBytes = await resumeFile.arrayBuffer();
      const resumeBuffer = Buffer.from(resumeBytes);
      try {
        resumeText = await extractTextFromBuffer(resumeBuffer, resumeFile.type, resumeFile.name);
      } catch (error) {
        console.error('Error extracting resume text:', error);
        return NextResponse.json({
          error: `Failed to extract text from resume: ${error instanceof Error ? error.message : 'Unknown error'}`
        }, { status: 400 });
      }
    }

    // Extract job description (from file or use provided text)
    let jobDescription = '';
    if (jobDescriptionFile) {
      const jdBytes = await jobDescriptionFile.arrayBuffer();
      const jdBuffer = Buffer.from(jdBytes);
      try {
        jobDescription = await extractTextFromBuffer(jdBuffer, jobDescriptionFile.type, jobDescriptionFile.name);
      } catch (error) {
        console.error('Error extracting job description text:', error);
        return NextResponse.json({
          error: `Failed to extract text from job description file: ${error instanceof Error ? error.message : 'Unknown error'}`
        }, { status: 400 });
      }
    } else {
      jobDescription = jobDescriptionText;
    }

    // Validate extracted text
    if (!resumeText || resumeText.trim().length === 0) {
      return NextResponse.json({
        error: 'No text could be extracted from the resume file'
      }, { status: 400 });
    }

    if (!jobDescription || jobDescription.trim().length === 0) {
      return NextResponse.json({
        error: 'No text could be extracted from the job description'
      }, { status: 400 });
    }

    // Analyze with Gemini
    try {
      console.log('Starting Gemini analysis...');
      const analysis = await analyzeResumeWithGemini(resumeText, jobDescription, {
        includeImprovementSuggestions
      });
      console.log('Gemini analysis completed successfully');

      return NextResponse.json({
        success: true,
        analysis,
        hasProAccess: userHasProAccess,
        includeImprovementSuggestions,
        resumeTextFull: resumeText,
        jobDescriptionFull: jobDescription,
        resumeText: resumeText, // Full preview
        jobDescriptionText: jobDescription, // Full preview
      });
    } catch (error) {
      console.error('Error analyzing with Gemini:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      // Return specific error based on the type
      if (errorMessage.includes('API key')) {
        return NextResponse.json({
          error: 'Gemini API key is not configured or invalid. Please set up your API key.'
        }, { status: 500 });
      } else if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
        return NextResponse.json({
          error: 'API quota exceeded. Please try again later.'
        }, { status: 429 });
      } else if (errorMessage.includes('permission') || errorMessage.includes('forbidden')) {
        return NextResponse.json({
          error: 'API access denied. Please check your API key permissions.'
        }, { status: 403 });
      } else {
        return NextResponse.json({
          error: `Analysis failed: ${errorMessage}`
        }, { status: 500 });
      }
    }

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
}
