# AI Immigration Assistant - Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Google Gemini API key

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Gemini API Key

1. Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Open `.env.local` file in the root directory
3. Replace `your_gemini_api_key_here` with your actual API key:

```
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Start the Development Server

```bash
npm run dev
```

This will start both the frontend (Vite) and backend (Convex) servers.

The app will open automatically in your browser at `http://localhost:5173`

## Features

### Document Upload & Analysis
- Upload I-94, I-20, or H-1B documents (PDF, JPG, PNG)
- AI-powered document analysis using Gemini
- Automatic extraction of key dates and information

### Dashboard
- View all uploaded documents
- Track document analysis status
- See upcoming deadlines
- Complete deadline tasks

### Deadline Tracking
- Automatically created from document analysis
- Manual deadline creation
- Importance levels (critical, important, info)
- Completion tracking

## Project Structure

```
├── convex/                    # Backend (Convex)
│   ├── schema.ts             # Database schema
│   ├── documents.ts          # Document queries/mutations
│   ├── documentsActions.ts   # AI analysis actions
│   ├── documentsInternal.ts  # Internal mutations
│   ├── deadlines.ts          # Deadline management
│   └── auth.ts               # Authentication
├── src/                       # Frontend (React)
│   ├── App.tsx               # Landing page
│   ├── Dashboard.tsx         # User dashboard
│   ├── SignInForm.tsx        # Authentication form
│   └── index.css             # Styles
└── .env.local                # Environment variables
```

## Authentication

The app uses Convex Auth with:
- Email/Password authentication
- Anonymous authentication (for testing)

## Database Schema

### Documents Table
- User ID
- Document type (I-94, I-20, H-1B)
- File reference
- Analysis status
- Analysis results (summary, key dates, next steps, warnings)

### Deadlines Table
- User ID
- Document reference (optional)
- Title and description
- Due date
- Importance level
- Completion status

## Deployment

To deploy to production:

1. Deploy Convex backend:
```bash
npx convex deploy
```

2. Build frontend:
```bash
npm run build
```

3. Deploy the `dist` folder to your hosting provider (Vercel, Netlify, etc.)

## Support

For issues or questions, please refer to:
- [Convex Documentation](https://docs.convex.dev)
- [Gemini API Documentation](https://ai.google.dev/docs)
