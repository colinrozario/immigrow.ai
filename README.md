# immigro.ai

> Your Personal AI Immigration Assistant

A modern web application that helps international students and immigrants analyze immigration documents, track deadlines, and receive AI-powered guidance for I-94, I-20, and H-1B applications.

##  Features

- **AI Document Analysis** - Upload and analyze I-94, I-20, and H-1B documents using Google Gemini AI
- **Smart Deadline Tracking** - Automatically extract and track important dates from your documents
- **Personalized Dashboard** - View all your documents and upcoming deadlines in one place
- **Secure Authentication** - Email/password and anonymous authentication powered by Convex Auth
- **Real-time Updates** - Instant document processing status and analysis results
- **Mobile-First Design** - Clean, responsive interface that works on all devices

##  Quick Start

### Prerequisites

- Node.js 18 or higher
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai_immigration_assistant_website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Open `.env.local` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   This will start both the frontend (Vite) and backend (Convex) servers. The app will automatically open at `http://localhost:5173`

## 📁 Project Structure

```
├── convex/                      # Backend (Convex)
│   ├── schema.ts               # Database schema
│   ├── documents.ts            # Document queries & mutations
│   ├── documentsActions.ts     # AI analysis actions (Node.js)
│   ├── documentsInternal.ts    # Internal mutations
│   ├── deadlines.ts            # Deadline management
│   ├── auth.ts                 # Authentication config
│   └── http.ts                 # HTTP routes
├── src/                         # Frontend (React + TypeScript)
│   ├── App.tsx                 # Landing page & routing
│   ├── Dashboard.tsx           # User dashboard
│   ├── SignInForm.tsx          # Authentication form
│   ├── SignOutButton.tsx       # Sign out component
│   └── index.css               # Global styles
├── .env.local                   # Environment variables
└── package.json                # Dependencies
```

##  Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Convex React** - Real-time data sync

### Backend
- **Convex** - Backend-as-a-Service with real-time database
- **Convex Auth** - Authentication system
- **Google Gemini AI** - Document analysis
- **Node.js** - Runtime for AI actions

## 📊 Database Schema

### Documents Table
- User ID (reference)
- Document type (I-94, I-20, H-1B)
- File storage ID
- Upload timestamp
- Processing status
- AI analysis results (summary, key dates, next steps, warnings)

### Deadlines Table
- User ID (reference)
- Document ID (optional reference)
- Title and description
- Due date
- Importance level (critical, important, info)
- Completion status

##  Authentication

The app uses [Convex Auth](https://auth.convex.dev/) with two authentication methods:

1. **Email/Password** - Standard account creation and login
2. **Anonymous** - Quick access for testing without registration

##  AI Document Analysis

Documents are analyzed using Google's Gemini 1.5 Flash model, which:

1. Extracts key information specific to document type
2. Identifies critical dates and deadlines
3. Provides personalized next steps
4. Highlights important warnings
5. Automatically creates deadline reminders

##  Available Scripts

- `npm run dev` - Start development servers (frontend + backend)
- `npm run dev:frontend` - Start only the frontend server
- `npm run dev:backend` - Start only the Convex backend
- `npm run build` - Build for production
- `npm run lint` - Run TypeScript and build checks

##  Deployment

### Deploy Backend (Convex)

```bash
npx convex deploy
```

### Deploy Frontend

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting provider:
   - [Vercel](https://vercel.com)
   - [Netlify](https://netlify.com)
   - [Cloudflare Pages](https://pages.cloudflare.com)

3. Set environment variables on your hosting platform:
   - `VITE_CONVEX_URL` - Your Convex deployment URL
   - `GEMINI_API_KEY` - Your Gemini API key

## 🔒 Security & Privacy

- All documents are securely stored in Convex's file storage
- User data is isolated and protected by authentication
- AI analysis happens server-side to protect API keys
- No document data is shared with third parties

## ⚠️ Disclaimer

This tool provides informational guidance only and is not legal advice. Always consult with qualified immigration attorneys for legal matters and official guidance.

## 📚 Resources

- [Convex Documentation](https://docs.convex.dev)
- [Convex Auth Documentation](https://auth.convex.dev)
- [Google Gemini AI Documentation](https://ai.google.dev/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)


---

Built with ❤️ by COLIN for international students and immigrants
