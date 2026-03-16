const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const Groq = require('groq-sdk');
const ytSearch = require('yt-search');

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// POST /api/roadmaps/generate
router.post('/generate', async (req, res) => {
  const { topic, depth = 'standard' } = req.body;
  
  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    let depthInstruction = "Provide around 10 steps to master the topic from beginner to advanced.";
    if (depth === 'brief') {
      depthInstruction = "Provide a brief introductory roadmap of around 5 steps.";
    } else if (depth === 'comprehensive') {
      depthInstruction = "Provide an extensive, comprehensive roadmap of at least 12 to 15 steps to break down the topic from beginner to expert.";
    }

    const systemPrompt = `
      You are an expert personalized learning architect.
      Generate a structured learning roadmap for the topic: "${topic}".
      
      ${depthInstruction}
      
      Return a JSON object with a single key "steps" containing an array of objects.
      Example:
      {
        "steps": [
          {
            "title": "...",
            "theory": "...",
            "estimated_time": "...",
            "youtube_query": "...",
            "order": 1
          }
        ]
      }
    `;

    // 1. Call Groq to generate the steps
    let aiSteps = [];
    if (!process.env.GROQ_API_KEY) {
      console.log('No Groq API key found, returning mock data.');
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
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: systemPrompt }],
        model: 'llama-3.1-8b-instant',
        temperature: 0.5,
        max_tokens: 8000,
        response_format: { type: 'json_object' } // Groq supports JSON mode!
      });
      
      let text = chatCompletion.choices[0].message.content;
      
      // Safety parsing for markdown code blocks just in case
      if (text.startsWith('\`\`\`json')) {
         text = text.substring(7, text.length - 3);
      }
      
      // JSON mode expects an object, so the LLM usually wraps it like { "steps": [...] }
      const parsedJSON = JSON.parse(text);
      if (parsedJSON.steps && Array.isArray(parsedJSON.steps)) {
         aiSteps = parsedJSON.steps;
      } else if (Array.isArray(parsedJSON)) {
         aiSteps = parsedJSON;
      } else {
         // Fallback if LLM randomly returned object keys
         aiSteps = Object.values(parsedJSON).find(val => Array.isArray(val)) || [];
      }
    }
    
    // 2. Fetch YouTube Videos for each step (fallback to yt-search if no API key)
    const finalizedSteps = [];
    for (const step of aiSteps) {
      let youtube_video_id = null;
      try {
        if (YOUTUBE_API_KEY) {
          const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(step.youtube_query)}&type=video&key=${YOUTUBE_API_KEY}`);
          const ytData = await ytRes.json();
          if (ytData.items && ytData.items.length > 0) {
            youtube_video_id = ytData.items[0].id.videoId;
          }
        } else {
          // Free fallback using yt-search scraper
          const r = await ytSearch(step.youtube_query);
          const videos = r.videos.slice(0, 1);
          if (videos.length > 0) {
            youtube_video_id = videos[0].videoId;
          }
        }
      } catch (ytError) {
        console.error('Error fetching YouTube video:', ytError);
      }
      
      finalizedSteps.push({
        ...step,
        youtube_video_id
      });
    }

    // 3. Save roadmap to Database
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
          }
        }
      });
    } catch (dbError) {
      console.warn("DB not connected yet, returning without saving to DB:", dbError.message);
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
