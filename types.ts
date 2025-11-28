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
  type: 'tax' | 'holiday' | 'admin' | 'receivable';
  amount?: number;
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
  payload: any;
  summary: string;
}

export interface AppNotification {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  type: 'info' | 'proposal' | 'alert' | 'agent-debug';
}

// Widget System
export type WidgetType = 'calendar_official' | 'tax_summary' | 'revenue_projection' | 'sector_expenses' | 'alerts_feed';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  w: number; // width col span
  h: number; // height row span
}

export interface FinancialRecord {
  category: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
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