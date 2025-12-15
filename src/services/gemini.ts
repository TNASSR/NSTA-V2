import { GoogleGenAI } from "@google/genai";
import { ClassLevel, Subject, Chapter, LessonContent, Language, Board, Stream, ContentType, MCQItem, SystemSettings } from "../types";

// MANUAL BACKUP KEY
const MANUAL_API_KEY = "AIzaSyCUvxGE45jnwMmQ4u-8L1NJowela6DckQo"; 

const getAvailableKeys = (): string[] => {
    try {
        const storedSettings = localStorage.getItem('nst_system_settings');
        const keys: string[] = [];
        if (storedSettings) {
            const parsed = JSON.parse(storedSettings) as SystemSettings;
            if (parsed.apiKeys && Array.isArray(parsed.apiKeys)) {
                parsed.apiKeys.forEach(k => { if(k.trim()) keys.push(k.trim()); });
            }
        }
        if (MANUAL_API_KEY) keys.push(MANUAL_API_KEY);
        // Only use process.env if available (Vercel builds)
        if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
             keys.push(process.env.GEMINI_API_KEY);
        }
        return Array.from(new Set(keys));
    } catch (e) {
        return MANUAL_API_KEY ? [MANUAL_API_KEY] : [];
    }
};

const executeWithRotation = async <T>(
    operation: (ai: GoogleGenAI) => Promise<T>
): Promise<T> => {
    const keys = getAvailableKeys();
    const shuffledKeys = keys.sort(() => 0.5 - Math.random());
    let lastError: any = null;

    for (const key of shuffledKeys) {
        try {
            const ai = new GoogleGenAI({ apiKey: key });
            return await operation(ai);
        } catch (error: any) {
            console.warn(`Key failed. Retrying...`, error.message);
            lastError = error;
        }
    }
    throw lastError || new Error("All API Keys failed.");
};

const chapterCache: Record<string, Chapter[]> = {};
const lessonCache: Record<string, LessonContent> = {};

const cleanJson = (text: string) => text.replace(/```json/g, '').replace(/```/g, '').trim();

const getOfflineChapters = (subject: Subject): Chapter[] => {
    return [
        { id: 'ch-1', title: `Introduction to ${subject.name}`, description: "Basics and Fundamental Concepts." },
        { id: 'ch-2', title: "Core Principles", description: "Understanding the main theories." },
        { id: 'ch-3', title: "Previous Year Questions", description: "Important questions." }
    ];
};

export const generateDevCode = async (userPrompt: string): Promise<string> => {
    try {
        return await executeWithRotation(async (ai) => {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: userPrompt,
                config: { systemInstruction: "You are a React Developer. Output only code." }
            });
            return response.text || "// Error generating code";
        });
    } catch (error) {
        return "// Offline: AI Developer unavailable.";
    }
};

export const fetchChapters = async (
  board: Board, classLevel: ClassLevel, stream: Stream | null, subject: Subject, language: Language
): Promise<Chapter[]> => {
  const streamKey = stream ? `-${stream}` : '';
  const cacheKey = `${board}-${classLevel}${streamKey}-${subject.name}-${language}`;
  
  if (chapterCache[cacheKey]) return chapterCache[cacheKey];

  const prompt = `List 10 standard chapters for Class ${classLevel} ${stream ? stream : ''} Subject: ${subject.name} (${board}). Return JSON array: [{"title": "...", "description": "..."}].`;

  try {
    const data = await executeWithRotation(async (ai) => {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        const text = response.text;
        if (!text) throw new Error("Empty response");
        return JSON.parse(cleanJson(text));
    });
    const chapters = data.map((item: any, index: number) => ({
      id: `ch-${index + 1}`,
      title: item.title,
      description: item.description || ''
    }));
    chapterCache[cacheKey] = chapters;
    return chapters;
  } catch (error) {
    const data = getOfflineChapters(subject);
    chapterCache[cacheKey] = data;
    return data;
  }
};

export const fetchLessonContent = async (
  board: Board, classLevel: ClassLevel, stream: Stream | null, subject: Subject, chapter: Chapter, language: Language, type: ContentType, existingMCQCount: number = 0, isPremium: boolean = false
): Promise<LessonContent> => {
  const streamKey = stream ? `-${stream}` : '';
  const cacheKey = `${board}-${classLevel}${streamKey}-${subject.name}-${chapter.id}-${language}-${type}-${existingMCQCount}`;
  
  if (lessonCache[cacheKey]) return lessonCache[cacheKey];

  let prompt = '';
  if (type.includes('MCQ')) {
      prompt = `Generate ${type === 'MCQ_ANALYSIS' ? '15 Hard' : '5 Standard'} MCQs for Class ${classLevel} ${subject.name} Chapter: "${chapter.title}". Format: JSON Array [{question, options[], correctAnswer(int), explanation}]. Language: ${language}.`;
  } else {
      prompt = `Create ${type === 'NOTES_PREMIUM' ? 'Detailed Premium' : 'Simple'} Notes for Class ${classLevel} ${subject.name}, Chapter: "${chapter.title}". Language: ${language}. Use Markdown.`;
  }

  const modelToUse = (type.includes('PREMIUM') || isPremium) ? 'gemini-2.0-flash' : 'gemini-2.5-flash';

  try {
    const text = await executeWithRotation(async (ai) => {
        const response = await ai.models.generateContent({
            model: modelToUse,
            contents: prompt,
            config: { responseMimeType: type.includes('MCQ') ? "application/json" : "text/plain" }
        });
        if (!response.text) throw new Error("No response text");
        return response.text;
    });

    let finalContent = text;
    let mcqData: MCQItem[] | undefined = undefined;

    if (type.includes('MCQ')) {
        mcqData = JSON.parse(cleanJson(text));
        finalContent = "MCQ_DATA_LOADED";
    }

    const content: LessonContent = {
      id: Date.now().toString(),
      title: chapter.title,
      subtitle: `${subject.name} - (${type})`,
      content: finalContent,
      type: type,
      dateCreated: new Date().toISOString(),
      subjectName: subject.name,
      mcqData: mcqData
    };
    lessonCache[cacheKey] = content;
    return content;
  } catch (error) {
    const content: LessonContent = {
        id: 'offline', title: chapter.title, subtitle: 'Offline', content: '# Offline Mode\nAI unavailable.', type, dateCreated: new Date().toISOString(), subjectName: subject.name
    };
    return content;
  }
};

