# JobFit AI 🎯

A powerful Next.js application that uses Google's Gemini AI to analyze resumes against job descriptions and provide detailed feedback and improvement suggestions. Features a sleek **black and red dark theme** with stunning animations.

![JobFit AI](https://img.shields.io/badge/AI-Powered-red?style=for-the-badge&logo=google&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript&logoColor=white)

## ✨ Features

- **🤖 AI-Powered Analysis**: Powered by Google Gemini AI for intelligent resume evaluation
- **📊 ATS Optimization**: Get ATS compatibility scores and optimization tips
- **🎯 Skills Matching**: See how your skills align with job requirements
- **📈 Visual Analytics**: Beautiful charts and graphs for data visualization
- **🔑 Keyword Analysis**: Identify missing and matching keywords
- **💡 Smart Suggestions**: Personalized interview tips and improvement recommendations
- **📁 Multi-Format Support**: Upload PDF, DOC, and DOCX resume formats
- **🌙 Dark Theme**: Sleek black and red design with smooth animations
- **📱 Responsive**: Works seamlessly on desktop and mobile devices
- **📊 Vercel Analytics**: Built-in analytics for tracking usage

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **AI**: Google Generative AI (Gemini 1.5)
- **Charts**: Chart.js, react-chartjs-2
- **File Processing**: PDF-Parse, Mammoth.js
- **File Upload**: React Dropzone
- **Analytics**: Vercel Analytics

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google AI Studio API key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd resume-analyzer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env.local` file

## Usage

1. **Upload Resume**: Click or drag and drop your resume file (PDF, DOC, or DOCX)
2. **Enter Job Description**: Paste the job description in the text area
3. **Analyze**: Click the "Analyze Resume" button
4. **Review Results**: Get detailed AI-powered feedback and suggestions

## Project Structure

```
src/
├── app/
│   ├── api/analyze/          # API route for resume analysis
│   ├── globals.css           # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── button.tsx
│   │   ├── file-upload.tsx
│   │   ├── loading.tsx
│   │   └── textarea.tsx
│   └── analysis-results.tsx  # Results display component
└── lib/
    ├── gemini.ts            # Gemini AI integration
    ├── text-extraction.ts   # File text extraction
    └── utils.ts             # Utility functions
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:
1. Check the existing issues
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## Acknowledgments

- Google Gemini AI for powering the analysis
- Aceternity UI for beautiful components
- Next.js team for the amazing framework
