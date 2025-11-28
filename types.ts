import { Type } from '@google/genai';

export enum DocType {
  RECEIPT = 'Nota Fiscal',
  BANK_SLIP = 'Boleto',
  DARF = 'DARF',
  REPORT = 'Relatório',
  UNKNOWN = 'Documento Geral'
}

export interface FinDocument {
  id: string;
  name: string;
  type: DocType;
  date: string;
  amount: number;
  tags: string[];
  summary: string;
  status: 'paid' | 'pending' | 'overdue';
  alerts?: string[];
  imageUrl?: string;
}

export interface UserProfile {
  name: string;
  companyName: string;
  cnpj: string;
  regime: 'MEI' | 'Simples Nacional' | 'Lucro Presumido';
}

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  type: 'tax' | 'holiday' | 'admin';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: { uri: string; title?: string }[];
}

// Intent System Types
export interface DetectedIntent {
  type: 'NAVIGATE' | 'CREATE_DOC' | 'QUERY_TAX' | 'UNKNOWN';
  confidence: number;
  payload: any; // e.g., { targetScreen: 'documents' } or { amount: 100 }
  summary: string; // "Parece que você quer cadastrar uma nota de R$100"
}

export interface AppNotification {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  type: 'info' | 'proposal' | 'alert';
}

// Schema for Gemini Intent Deduction
export const IntentSchema = {
  type: Type.OBJECT,
  properties: {
    intentType: { type: Type.STRING, enum: ['NAVIGATE', 'CREATE_DOC', 'QUERY_TAX', 'UNKNOWN'] },
    confidence: { type: Type.NUMBER, description: "0.0 to 1.0" },
    summary: { type: Type.STRING },
    parameters: {
      type: Type.OBJECT,
      properties: {
        target: { type: Type.STRING },
        amount: { type: Type.NUMBER },
        date: { type: Type.STRING },
        description: { type: Type.STRING }
      }
    }
  },
  required: ["intentType", "confidence", "summary"]
};