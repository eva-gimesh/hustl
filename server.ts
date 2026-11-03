import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '200kb' }));

// Model is configurable; override with GEMINI_MODEL in .env if Google renames models.
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Minimal in-memory rate limiter (per IP) so a public deployment cannot drain your Gemini quota.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;
const hits = new Map<string, { count: number; reset: number }>();
function rateLimit(req: Request, res: Response, next: () => void) {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + RATE_WINDOW_MS });
    return next();
  }
  entry.count += 1;
  if (entry.count > RATE_MAX) {
    res.status(429).json({ error: 'RATE_LIMITED', message: 'Too many AI requests. Please wait a minute.' });
    return;
  }
  next();
}

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey.trim() !== '' && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI with provided key:', err);
  }
}

// AI Health Check endpoint
app.get('/api/ai/health', (_req: Request, res: Response) => {
  res.json({
    available: !!aiClient,
    model: MODEL,
    configured: !!apiKey && apiKey !== 'MY_GEMINI_API_KEY',
    message: aiClient
      ? `Gemini (${MODEL}) is active and ready.`
      : 'GEMINI_API_KEY is not configured or using placeholder.',
  });
});

// AI Generation endpoint
app.post('/api/ai/generate', rateLimit, async (req: Request, res: Response): Promise<void> => {
  try {
    const { task, prompt: rawPrompt, context } = req.body;
    const prompt = typeof rawPrompt === 'string' ? rawPrompt.slice(0, 4000) : '';

    if (!task) {
      res.status(400).json({ error: 'Missing required field "task"' });
      return;
    }

    if (!aiClient) {
      // Graceful degraded mode when API key is not yet set up
      res.status(503).json({
        error: 'GEMINI_API_KEY_UNAVAILABLE',
        message:
          'Gemini API key is not configured in environment secrets. Add GEMINI_API_KEY to your .env file and restart the server.',
      });
      return;
    }

    let systemInstruction = `You are HUSTL AI, an intelligent co-pilot embedded inside HUSTL — a gaming-inspired, competitive talent and startup platform tailored for India's emerging student builders, creators, developers, and founders.
Key Rules:
1. Always frame prices and stipends in Indian Rupees (₹ / INR) using realistic Indian student-friendly rates (e.g. internships ₹5,000–₹20,000/mo, freelance ₹1,000–₹25,000, entry roles ₹3.6–₹8 LPA).
2. Never invent credentials, college degrees, or work experience that the user did not provide.
3. Be concise, punchy, modern, and high-impact. Avoid corporate fluff, robotic clichés, or generic advice.
4. Use only facts present in the provided context. If information is missing, say so rather than guessing. Never invent salary, employment terms, users, or experience.
5. Output structured JSON where requested, or clean Markdown formatted responses.`;

    let userPrompt = prompt || '';
    let responseMimeType = 'text/plain';

    switch (task) {
      case 'profile_improve':
        systemInstruction += ` You are refining a builder's public profile. Return a JSON object with:
- "headline": an punchy 1-line gaming/startup title (e.g. "Full-stack Systems Builder | React & Distributed Nodes")
- "bio": a high-impact 2-3 sentence intro emphasizing real skills, proof of work, and ambition
- "skillSuggestions": array of 4-6 recommended complementary skills to learn or showcase
- "experienceTips": array of 2-3 actionable improvements for existing experience bullet points`;
        responseMimeType = 'application/json';
        userPrompt = `Current Profile Context:\n${JSON.stringify(context, null, 2)}\n\nUser Goal / Request:\n${prompt}`;
        break;

      case 'resume_assist':
        systemInstruction += ` You are crafting high-velocity resume bullet points using the STAR framework (Situation, Task, Action, Result) with metrics and action verbs. Return a JSON object with:
- "bullets": array of 3-5 punchy, metric-driven bullet points
- "summary": a strong 2-line executive summary
- "keywordsMatched": array of high-value technical keywords identified`;
        responseMimeType = 'application/json';
        userPrompt = `Candidate Details & Experience:\n${JSON.stringify(context, null, 2)}\n\nTarget Role or Description:\n${prompt}`;
        break;

      case 'project_desc':
        systemInstruction += ` You are an expert product manager drafting a freelance project listing on HUSTL. Return a JSON object with:
- "title": a clear, attractive project title
- "description": 2-3 paragraphs detailing the exact scope, user journey, and delivery expectations
- "deliverables": array of 3-5 specific tangible deliverables
- "requirements": array of 3-5 clear qualifications
- "recommendedSkills": array of 4-6 technical or design skills
- "suggestedBudgetMin": realistic minimum INR budget (number only, e.g. 5000)
- "suggestedBudgetMax": realistic maximum INR budget (number only, e.g. 12000)
- "suggestedDuration": suggested timeframe (e.g. "2–3 weeks")`;
        responseMimeType = 'application/json';
        userPrompt = `Project Brief / Idea:\n${prompt}\n\nClient Context:\n${JSON.stringify(context, null, 2)}`;
        break;

      case 'job_desc':
        systemInstruction += ` You are a talent architect drafting an internship or job posting on HUSTL. Return a JSON object with:
- "title": standard industry job title
- "overview": compelling 2-paragraph company & role overview
- "responsibilities": array of 4-6 specific day-to-day responsibilities
- "qualifications": array of 4-6 realistic requirements (student/fresher accessible)
- "requiredSkills": array of 4-6 core skills
- "bonusSkills": array of 3-4 nice-to-have skills
- "benefits": array of 4 student-friendly perks (stipend in INR, flexible hours, mentorship, etc.)
- "suggestedStipend": suggested stipend string (e.g. "₹12,000 - ₹18,000 / month")`;
        responseMimeType = 'application/json';
        userPrompt = `Job Information / Requirements:\n${prompt}\n\nCompany Context:\n${JSON.stringify(context, null, 2)}`;
        break;

      case 'teamup_match':
        systemInstruction += ` You analyze synergy between a user profile and a startup idea on HUSTL TeamUp. Return a JSON object with:
- "matchScore": integer 0-100 reflecting ONLY the overlap between the listed skills and the listed role/idea requirements (be conservative; low if little overlaps)
- "synergySummary": 2-3 sentences explaining why their skills complement the startup's mission
- "complementarySkills": array of strings listing matching/synergistic skills
- "growthOpportunities": array of 2 strings showing what the builder will learn
- "recommendedPitchAngle": 1 sentence advising how the candidate should pitch themselves to the founder`;
        responseMimeType = 'application/json';
        userPrompt = `User Profile:\n${JSON.stringify(context?.user, null, 2)}\n\nStartup Idea:\n${JSON.stringify(context?.idea, null, 2)}`;
        break;

      case 'opportunity_search':
        systemInstruction += ` You are a natural language search parser for HUSTL opportunities (freelance projects, jobs/internships, and TeamUp startups).
Analyze the user's natural search query and return a JSON object with:
- "keywords": array of relevant search terms and skills (e.g. ["React", "Frontend"])
- "category": "freelance" | "recruit" | "teamup" | "all"
- "workMode": "Remote" | "Hybrid" | "On-site" | "any"
- "maxBudget": numeric INR ceiling if mentioned, or null
- "minBudget": numeric INR floor if mentioned, or null
- "experienceLevel": "Entry" | "Intermediate" | "Expert" | "any"
- "intentExplanation": short 1-line confirmation (e.g. "Searching for remote React freelance gigs under ₹15,000")`;
        responseMimeType = 'application/json';
        userPrompt = `User Search Query: "${prompt}"`;
        break;

      case 'application_assist':
        systemInstruction += ` You are assisting a candidate in drafting a compelling, authentic application pitch for an opportunity on HUSTL.
Return a JSON object with:
- "coverLetter": 2-3 focused paragraphs connecting candidate's genuine background to the listing
- "relevantHighlights": array of 3 key points the applicant brings to the table
- "suggestedRate": optional proposed rate or stipend string in INR`;
        responseMimeType = 'application/json';
        userPrompt = `Applicant Profile:\n${JSON.stringify(context?.profile, null, 2)}\n\nOpportunity Listing:\n${JSON.stringify(context?.opportunity, null, 2)}\n\nCustom User Note:\n${prompt}`;
        break;

      default:
        // Generic text assistant
        userPrompt = prompt;
        break;
    }

    const response = await aiClient.models.generateContent({
      model: MODEL,
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: responseMimeType === 'application/json' ? 'application/json' : undefined,
      },
    });

    const text = response.text || '';

    if (responseMimeType === 'application/json') {
      try {
        const parsed = JSON.parse(text);
        res.json({ success: true, data: parsed, raw: text });
      } catch {
        // Fallback if model enclosed in markdown block
        const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
        try {
          const parsed = JSON.parse(cleaned);
          res.json({ success: true, data: parsed, raw: text });
        } catch {
          res.json({ success: true, data: { text }, raw: text });
        }
      }
    } else {
      res.json({ success: true, text });
    }
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      error: 'AI_GENERATION_FAILED',
      message: error?.message || 'Failed to generate AI response.',
    });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const HOST = process.env.HOST || '127.0.0.1';
  app.listen(PORT, HOST, () => {
    console.log(`HUSTL running at http://localhost:${PORT}  (AI ${aiClient ? 'enabled' : 'disabled — set GEMINI_API_KEY'})`);
  });
}

startServer().catch(err => {
  console.error('Server startup error:', err);
  process.exit(1);
});
