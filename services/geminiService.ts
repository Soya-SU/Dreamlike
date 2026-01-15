import { GoogleGenAI, Type } from "@google/genai";
import { MOCK_MODE, MOCK_ANALYSIS_RESPONSE, GEMINI_MODEL, GEMINI_IMAGE_MODEL } from "../constants";
import { DreamAnalysis, Language } from "../types";

export const analyzeDream = async (dreamText: string, lang: Language): Promise<DreamAnalysis> => {
  if (MOCK_MODE) {
    console.log("Using Mock Data for Analysis");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(JSON.parse(MOCK_ANALYSIS_RESPONSE));
      }, 1500);
    });
  }

  if (!process.env.API_KEY) {
    throw new Error("API Key not found in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemPromptZh = `
    你是一位精通现代心理学（荣格/弗洛伊德流派）与中国传统周公解梦的解梦大师。
    请分析我的梦境：
    "${dreamText}"

    要求：
    1. 提取3个核心视觉意象关键词(keywords) [英文]。
    2. psychological_analysis: 提供一段基于心理学的深度解析（简体中文）。侧重于潜意识投射、情绪状态和心理需求。
    3. zhou_gong_analysis: 提供一段传统的"周公解梦"风格解读（简体中文）。侧重于吉凶预示、传统象征意义，可以使用稍微古朴或神秘的语气。
    4. grounding: 提供一段"好友口吻"的现实锚定语（简体中文），温暖而治愈。
    5. music_mood: 推荐一种适合该梦境情绪的音乐基调。
    6. suggested_questions: 提出3个*用户*可能会问你的问题（简体中文）。例如"这个梦预示着发财吗？"或"为什么我会梦到蛇？"。不要问用户感受，而是模仿用户的好奇心。
  `;

  const systemPromptEn = `
    You are a master of dream interpretation, skilled in both modern psychology (Jungian/Freudian) and traditional Chinese "Duke of Zhou" dream interpretation.
    Please analyze my dream:
    "${dreamText}"

    Requirements:
    1. Extract 3 core visual imagery keywords (keywords) [English].
    2. psychological_analysis: Provide a deep psychological analysis [English]. Focus on subconscious projection, emotional states, and psychological needs.
    3. zhou_gong_analysis: Provide a traditional "Duke of Zhou" style interpretation [English]. Focus on omens and traditional symbolism.
    4. grounding: Provide a "friend-like" reality grounding statement [English], warm and healing.
    5. music_mood: Recommend a musical mood suitable for this dream.
    6. suggested_questions: Propose 3 questions *the user* might ask you about this dream [English]. E.g., "What does this symbol mean?" or "Is this a bad omen?". Do not ask the user how they feel; simulate the user's curiosity.
  `;

  const prompt = lang === 'zh' ? systemPromptZh : systemPromptEn;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            psychological_analysis: { type: Type.STRING },
            zhou_gong_analysis: { type: Type.STRING },
            grounding: { type: Type.STRING },
            music_mood: { type: Type.STRING },
            suggested_questions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["keywords", "psychological_analysis", "zhou_gong_analysis", "grounding", "music_mood", "suggested_questions"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text) as DreamAnalysis;
    
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    alert("API Error or Mock Mode needed. Switching to mock data for continuity.");
    return JSON.parse(MOCK_ANALYSIS_RESPONSE);
  }
};

export const generateDreamImage = async (keywords: string[]): Promise<string> => {
  const promptText = `Surreal, artistic, dreamlike representation of: ${keywords.join(', ')}. Ethereal, misty, soft lighting, masterpiece, 8k resolution, deep space atmosphere.`;

  if (MOCK_MODE) {
    // Return Pollinations URL as fallback in mock mode
    const query = encodeURIComponent(keywords.join(' '));
    return `https://pollinations.ai/p/${query}?width=800&height=600&seed=${Math.floor(Math.random()*1000)}&nologo=true`;
  }

  if (!process.env.API_KEY) {
    console.warn("No API Key for image generation, falling back to pollinations.");
    const query = encodeURIComponent(keywords.join(' '));
    return `https://pollinations.ai/p/${query}?width=800&height=600&seed=${Math.floor(Math.random()*1000)}&nologo=true`;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_IMAGE_MODEL,
      contents: {
        parts: [{ text: promptText }],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    // Fallback
    const query = encodeURIComponent(keywords.join(' '));
    return `https://pollinations.ai/p/${query}?width=800&height=600&seed=${Math.floor(Math.random()*1000)}&nologo=true`;
  }
};

export const chatWithDream = async (history: {role: 'user'|'model', text: string}[], newMessage: string, lang: Language, anxietyTriggered: boolean = false): Promise<string> => {
  if (MOCK_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(lang === 'zh' ? "这是一个模拟的回复（包含了安慰）。" : "This is a mock response (with comfort).");
      }, 1000);
    });
  }

  if (!process.env.API_KEY) throw new Error("No API Key");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const historyFormatted = history.map(h => ({
    role: h.role,
    parts: [{ text: h.text }]
  }));

  const systemInstruction = lang === 'zh' 
    ? `你不再是高高在上的咨询师，而是用户无话不谈的知心好友。你的回复应该温暖、自然。
       规则：
       1. 始终基于当前的梦境解析作为上下文。
       2. 如果用户的输入表现出明显的焦虑、恐惧（如包含噩梦、害怕等词），请优先在回复中提供一段简短的【正念引导】或呼吸指令（例如："深呼吸，感受空气进入肺部..."）。
       3. 在对话的自然空隙（不是每次），适时提醒用户："聊完之后，如果你觉得累了，可以随时开启【入梦模式】（此处为虚构功能），我会一直陪着你。"
      `
    : `You are a close friend, not a therapist. Be warm, natural, and supportive.
       Rules:
       1. Always use the current dream analysis as context.
       2. If the user's input shows anxiety or fear, prioritize including a brief Mindfulness Guidance or breathing exercise in your response.
       3. Occasionally remind the user: "If you feel tired after chatting, you can switch to 'Sleep Mode' anytime. I will be here with you."
      `;

  const activeChat = ai.chats.create({
    model: GEMINI_MODEL,
    history: historyFormatted,
    config: { systemInstruction }
  });

  // If anxiety triggered, prepend a system note to the user message to force the behavior
  const finalMessage = anxietyTriggered 
    ? `[SYSTEM NOTE: User is anxious. Please provide soothing mindfulness guidance now.] ${newMessage}`
    : newMessage;

  const result = await activeChat.sendMessage({ message: finalMessage });
  return result.text || "";
};
