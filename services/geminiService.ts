import { GoogleGenAI, Type } from "@google/genai";
import { MODEL_SMART, MODEL_FAST, SYSTEM_INSTRUCTION_ADVISOR } from "../constants";
import { IntentSchema, DetectedIntent } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// System Instruction for the "Silent Observer"
const INTENT_SYSTEM_PROMPT = `
Você é o motor de inteligência de um software contábil profissional.
Sua função NÃO é conversar. Sua função é ANALISAR a entrada (texto ou transcrição de áudio) e DEDUZIR a intenção do usuário.
Retorne APENAS JSON seguindo o schema fornecido.
Se o usuário estiver reclamando ou frustrado, marque como UNKNOWN mas sugira ajuda no resumo.
`;

export const deduceUserIntent = async (input: string): Promise<DetectedIntent> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: MODEL_SMART,
      contents: { parts: [{ text: `Entrada do usuário: "${input}". Deduza a intenção.` }] },
      config: {
        systemInstruction: INTENT_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: IntentSchema,
        thinkingConfig: { thinkingBudget: 1024 } // Small budget just to validate logic
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    
    return {
      type: parsed.intentType || 'UNKNOWN',
      confidence: parsed.confidence || 0,
      payload: parsed.parameters || {},
      summary: parsed.summary || "Processando..."
    };
  } catch (error) {
    console.error("Intent Error", error);
    return { type: 'UNKNOWN', confidence: 0, payload: {}, summary: "Erro na análise." };
  }
};

export const analyzeDocumentImage = async (base64Image: string, mimeType: string) => {
  const ai = getAI();
   try {
    const response = await ai.models.generateContent({
      model: MODEL_SMART,
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: "Extraia dados contábeis. Seja estritamente técnico." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        // reusing schema from types if exported, or simplified here for brevity
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error(error);
    return {};
  }
};

export const askAdvisor = async (history: { role: string; text: string }[], message: string, needsSearch: boolean) => {
  const ai = getAI();
  
  // Format history for the API
  const formattedHistory = history.map(h => ({
    role: h.role,
    parts: [{ text: h.text }]
  }));

  const chat = ai.chats.create({
    model: MODEL_SMART,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_ADVISOR,
      tools: needsSearch ? [{ googleSearch: {} }] : []
    },
    history: formattedHistory
  });
  
  const result = await chat.sendMessage({ message });
  return {
    text: result.text,
    grounding: result.candidates?.[0]?.groundingMetadata?.groundingChunks
  };
};