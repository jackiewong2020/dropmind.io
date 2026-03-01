import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ProcessedDrop {
  title: string;
  cleanText: string;
  category: '工作' | '灵感' | '待办' | '阅读' | '书签';
  tags: string[];
  scheduledTime?: string;
}

export async function processDropText(rawText: string, aiModel: 'gemini-3.1' | 'kimi' = 'gemini-3.1'): Promise<ProcessedDrop> {
  try {
    const modelName = aiModel === 'kimi' ? 'gemini-3-flash-preview' : 'gemini-3.1-flash-preview';

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Analyze the following user input. 
      1. CRITICAL: If the user provides a specific instruction (e.g., "翻译", "总结", "润色", "提取待办"), you MUST follow that instruction to generate the 'cleanText'. Otherwise, clean up any filler words, fix the structure, and extract the core meaning.
      2. If it is a schedule or todo (e.g., "Meeting at 3pm on Sunday"), extract the time. 
      3. Categorize it into exactly one of these categories: '工作', '灵感', '待办', '阅读', '书签'.
      4. IMPORTANT RULE: If the input text is less than 600 characters AND it is not clearly a todo/schedule, work-related task, or a URL, you MUST categorize it as '灵感' (Inspiration).
      5. If the input is primarily a URL or a link to be saved, categorize it as '书签' (Bookmark).
      6. Extract a concise title for the input (e.g., "开周会" for "明天下午3点召开周会").
      
      Input: "${rawText}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A concise title for the content (e.g., '开周会')."
            },
            cleanText: { 
              type: Type.STRING, 
              description: "The result of following the user's instruction (if any), OR the cleaned up, structured version of the raw input." 
            },
            category: { 
              type: Type.STRING, 
              description: "Must be exactly one of: '工作', '灵感', '待办', '阅读', '书签'" 
            },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "1 to 3 relevant short tags (e.g., '会议', '开发', '想法')" 
            },
            scheduledTime: { 
              type: Type.STRING, 
              description: "Extracted time/date if it's a scheduled event (e.g., '周日下午3点'), otherwise empty string" 
            }
          },
          required: ["title", "cleanText", "category", "tags"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(response.text) as ProcessedDrop;
  } catch (error) {
    console.error("Error processing drop:", error);
    throw error;
  }
}
