# JobFit AI - Copilot Instructions

## Project Overview
JobFit AI is a Next.js 15 application that uses Google's Gemini AI to analyze resumes against job descriptions. Features a black and red dark theme with Framer Motion animations.

## Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **Animations**: Framer Motion
- **Charts**: Chart.js with react-chartjs-2
- **AI**: Google Generative AI (Gemini 1.5)
- **File Processing**: PDF-Parse, Mammoth.js
- **Analytics**: Vercel Analytics

## Project Structure
```
src/
  app/
    api/analyze/route.ts    # API endpoint for resume analysis
    globals.css             # Global styles and theme variables
    layout.tsx              # Root layout with Analytics
    page.tsx                # Main application page
  components/
    ui/                     # Reusable UI components
    enhanced-analysis-dashboard.tsx  # Analysis results display
  lib/
    gemini.ts               # Gemini AI integration
    text-extraction.ts      # PDF/DOC text extraction
    utils.ts                # Utility functions
  types/                    # TypeScript type definitions
```

## Design System
- **Theme**: Black and red dark theme
- **Primary Color**: Red (#dc2626, red-600)
- **Background**: Dark zinc (#0a0a0a)
- **Cards**: Zinc-900 with subtle borders
- **Animations**: Smooth Framer Motion transitions

## Development Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Environment Variables
- `GEMINI_API_KEY`: Google AI Studio API key (required)
