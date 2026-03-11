# SYNTHLEARN

SYNTHLEARN is an AI-powered personalized learning architect. You can input any topic, and it generates a structured, step-by-step learning roadmap.

The project features a modern futuristic UI design and integrates with Google Gemini for AI theory generation and the YouTube API for video resources.

## Features
- Dynamic AI Roadmap Generation (powered by Gemini)
- YouTube Video Integration
- Interactive Step-by-Step Timeline
- Progress Tracking

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS v4, Framer Motion, Lucide React
- **Backend**: Node.js, Express, PostgreSQL (via Supabase), Prisma ORM

## Local Setup

### 1. Database & Environment Setup
Add your API keys to `backend/.env`:
\`\`\`
DATABASE_URL="your-supabase-postgres-url"
GEMINI_API_KEY="your-gemini-key"
YOUTUBE_API_KEY="your-youtube-key"
PORT=5000
\`\`\`

Push the Prisma schema to the database:
\`\`\`bash
cd backend
npx prisma db push
\`\`\`

### 2. Run the Backend
\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`

### 3. Run the Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Open `http://localhost:5173` to view the app!
