import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { prompt, isPremium } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server API Key not configured' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    // Use Pro model for Premium users, Flash for free
    const modelName = isPremium ? 'gemini-2.0-pro-exp-02-05' : 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt
    });

    const text = response.text;
    return res.status(200).json({ text });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'AI Generation Failed' });
  }
}

