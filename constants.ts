export const APP_NAME = "Contador Amigo";

// Models
export const MODEL_FAST = 'gemini-2.5-flash';
export const MODEL_SMART = 'gemini-3-pro-preview';
export const MODEL_IMAGE = 'gemini-3-pro-preview'; // Using Pro for deep document analysis
export const MODEL_TTS = 'gemini-2.5-flash-preview-tts';
export const MODEL_LIVE = 'gemini-2.5-flash-native-audio-preview-09-2025';

// Search & Maps
export const USE_GROUNDING = true;

// Prompts
export const SYSTEM_INSTRUCTION_ADVISOR = `
Você é um contador e assistente financeiro extremamente paciente, gentil e seguro, chamado "Contador Amigo".
Seu cliente é um senhor que trabalha com transportes e está mudando o regime da empresa (Micro Empresa para MEI ou vice-versa).
1. NUNCA use jargões técnicos complicados. Se usar, explique imediatamente com uma analogia simples.
2. Seja proativo: alerte sobre vencimentos e direitos.
3. Ao analisar documentos, verifique se há impostos a recuperar ou pagar.
4. O tom deve ser de "segurar a mão" do usuário. Inspire confiança.
5. Se o usuário perguntar sobre leis, use o Google Search para garantir que a informação é atual (2024/2025).
`;
