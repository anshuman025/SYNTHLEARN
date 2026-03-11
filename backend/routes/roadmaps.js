const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { GoogleGenAI } = require('@google/genai');

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// POST /api/roadmaps/generate
router.post('/generate', async (req, res) => {
  const { topic } = req.body;
  
  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    const systemPrompt = `
      You are an expert personalized learning architect.
      Generate a structured learning roadmap for the topic: "${topic}".
      Return exactly a JSON array of steps (no markdown wrappers or other text).
      Each object must have the following keys:
      - title (string): Title of the step.
      - theory (string): Detailed markdown theory explaining this step (at least 2-3 paragraphs).
      - estimated_time (string): Estimated time to learn (e.g. "2 hours").
      - youtube_query (string): A precise search query to find the best YouTube tutorial for this specific step.
      - order (integer): The 1-indexed order of this step in the roadmap.
      Provide around 5 to 7 steps to master the topic from beginner to intermediate.
    `;

    // 1. Call Gemini to generate the steps
    // Mocking response if no API key is set
    let aiSteps = [];
    if (!process.env.GEMINI_API_KEY) {
      console.log('No Gemini API key found, returning mock data.');
      aiSteps = [
        {
          title: "Introduction to " + topic,
          theory: "**Background:**\\nHere is some theory about " + topic + ". It is very interesting.",
          estimated_time: "1 hour",
          youtube_query: topic + " tutorial for beginners",
          order: 1
        }
      ];
    } else {
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: systemPrompt,
      });
      // Try parsing the text output directly as JSON
      let text = response.text;
      if (text.startsWith('\`\`\`json')) {
        text = text.substring(7, text.length - 3);
      }
      aiSteps = JSON.parse(text);
    }
    
    // 2. Fetch YouTube Videos for each step (skipped if no API key)
    const finalizedSteps = [];
    for (const step of aiSteps) {
      let youtube_video_id = null;
      if (YOUTUBE_API_KEY) {
        try {
          const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(step.youtube_query)}&type=video&key=${YOUTUBE_API_KEY}`);
          const ytData = await ytRes.json();
          if (ytData.items && ytData.items.length > 0) {
            youtube_video_id = ytData.items[0].id.videoId;
          }
        } catch (ytError) {
          console.error('Error fetching YouTube video:', ytError);
        }
      }
      
      finalizedSteps.push({
        ...step,
        youtube_video_id
      });
    }

    // 3. Save roadmap to Database (if Prisma connection works)
    // We will save to DB only if we know the DB is up 
    // To be safe because we don't know if Supabase is connected yet, we could just return first.
    let createdRoadmap = null;
    try {
      // Create Roadmap
      createdRoadmap = await prisma.roadmap.create({
        data: {
          topic: topic,
          steps: {
            create: finalizedSteps.map(s => ({
              title: s.title,
              theory: s.theory,
              estimated_time: s.estimated_time,
              youtube_query: s.youtube_query,
              youtube_video_id: s.youtube_video_id,
              order: s.order
            }))
          }
        },
        include: {
          steps: {
            orderBy: { order: 'asc' }
          } // returning the updated steps with their IDs
        }
      });
    } catch (dbError) {
      console.warn("DB not connected yet, returning without saving to DB:", dbError.message);
      // Construct a mock roadmap
      createdRoadmap = {
        id: "mock-id",
        topic,
        steps: finalizedSteps.map((s, i) => ({ id: "step-"+i, ...s }))
      };
    }

    res.json(createdRoadmap);
  } catch (error) {
    console.error('Error generating roadmap:', error);
    res.status(500).json({ error: 'Failed to generate roadmap' });
  }
});

// GET /api/roadmaps/:id
router.get('/:id', async (req, res) => {
  try {
    const roadmap = await prisma.roadmap.findUnique({
      where: { id: req.params.id },
      include: { steps: { orderBy: { order: 'asc' } } }
    });
    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve roadmap' });
  }
});

// PUT /api/roadmaps/:roadmapId/steps/:stepId
router.put('/:roadmapId/steps/:stepId', async (req, res) => {
  try {
    const { is_completed } = req.body;
    const stepId = req.params.stepId;
    
    // Quick check if Prisma works
    const updatedStep = await prisma.step.update({
      where: { id: stepId },
      data: { is_completed }
    });
    res.json(updatedStep);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update step status' });
  }
});

module.exports = router;
