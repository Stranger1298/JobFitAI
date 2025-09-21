import mammoth from 'mammoth';

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return extractTextFromPDF(file);
  } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return extractTextFromTXT(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileType === 'application/msword' ||
    fileName.endsWith('.docx') ||
    fileName.endsWith('.doc')
  ) {
    return extractTextFromWord(file);
  } else {
    throw new Error('Unsupported file type. Please upload PDF, TXT, DOC, or DOCX files.');
  }
}

async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // For now, we'll return a placeholder since server-side PDF extraction
    // requires additional setup. We'll handle this in the API route.
    console.log('PDF file received:', file.name);
    throw new Error('PDF extraction will be handled server-side');
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF. Please ensure the file is not corrupted.');
  }
}

async function extractTextFromTXT(file: File): Promise<string> {
  try {
    const text = await file.text();
    return text.trim();
  } catch (error) {
    console.error('Error extracting text from TXT file:', error);
    throw new Error('Failed to extract text from TXT file. Please ensure the file is not corrupted.');
  }
}

async function extractTextFromWord(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
  } catch (error) {
    console.error('Error extracting text from Word document:', error);
    throw new Error('Failed to extract text from Word document. Please ensure the file is not corrupted.');
  }
}