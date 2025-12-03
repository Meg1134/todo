import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Priority, AIAssistResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const taskAssistSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    improvedDescription: {
      type: Type.STRING,
      description: "A professional, clear, and actionable description of the task based on the user's input, written in Chinese.",
    },
    suggestedPriority: {
      type: Type.STRING,
      enum: [Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.CRITICAL],
      description: "The suggested priority level based on the urgency or complexity implied.",
    },
    suggestedTags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of 1-3 short tags relevant to the task (e.g., '工作', '个人', '紧急') in Chinese.",
    },
  },
  required: ["improvedDescription", "suggestedPriority", "suggestedTags"],
};

export const enhanceTaskContent = async (
  title: string, 
  currentDescription: string
): Promise<AIAssistResponse | null> => {
  try {
    const prompt = `
      我正在创建一个待办任务。
      标题是: "${title}".
      当前的粗略描述是: "${currentDescription}".
      
      请分析这个任务。用中文优化描述，使其更具结构性和可执行性。
      建议一个优先级。
      建议相关的中文标签。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: taskAssistSchema,
        systemInstruction: "你是一个高效的生产力助手。你的目标是使任务描述清晰、简洁且可执行。请始终使用中文回复。"
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAssistResponse;
    }
    return null;
  } catch (error) {
    console.error("Gemini enhancement failed:", error);
    return null;
  }
};