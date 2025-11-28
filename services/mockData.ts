import { CalendarEvent, FinancialRecord } from '../types';

// Simulated Official Data (Receita Federal / Calendar)
export const OFFICIAL_CALENDAR: CalendarEvent[] = [
  {
    id: 'das-mei-curr',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 20).toISOString().split('T')[0],
    title: 'Vencimento DAS-MEI',
    description: 'Pagamento mensal obrigatório (INSS + ICMS/ISS). Evite multas.',
    priority: 'high',
    type: 'tax',
    amount: 75.60
  },
  {
    id: 'receivable-1',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString().split('T')[0],
    title: 'Recebimento: Transportadora Express',
    description: 'Frete lote #4451 - Previsão de crédito em conta.',
    priority: 'medium',
    type: 'receivable',
    amount: 4500.00
  },
  {
    id: 'selic-update',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    title: 'Atualização Taxa Selic',
    description: 'Nova taxa definida pelo COPOM: 10.75% a.a. Impacta parcelamentos.',
    priority: 'low',
    type: 'admin'
  },
  {
    id: 'irpf-alert',
    date: '2024-05-31',
    title: 'Fim Prazo IRPF',
    description: 'Último dia para entrega da declaração sem multa.',
    priority: 'high',
    type: 'tax'
  }
];

// Fictitious Financial Data for Charts
export const SECTOR_EXPENSES = [
  { name: 'Combustível', value: 3200, color: '#ef4444' }, // Red
  { name: 'Manutenção', value: 1500, color: '#f97316' }, // Orange
  { name: 'Impostos', value: 450, color: '#3b82f6' },   // Blue
  { name: 'Alimentação', value: 600, color: '#10b981' }, // Emerald
  { name: 'Outros', value: 300, color: '#64748b' }       // Slate
];

export const REVENUE_PROJECTION = [
  { month: 'Jan', real: 12000, projected: 12000 },
  { month: 'Fev', real: 13500, projected: 12500 },
  { month: 'Mar', real: 11000, projected: 13000 },
  { month: 'Abr', real: 14200, projected: 13500 },
  { month: 'Mai', real: 0, projected: 14000 }, // Future
  { month: 'Jun', real: 0, projected: 14500 }, // Future
];

export const getOfficialFeed = (): CalendarEvent[] => {
  return OFFICIAL_CALENDAR;
};

export const getFinancialSummary = () => {
  return {
    totalRevenue: 54000,
    totalExpenses: 28500,
    netIncome: 25500,
    projectedGrowth: 12.5
  };
};

export const mockOAuthLogin = async (): Promise<{ token: string, user: any }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        token: 'oauth_mock_token_123',
        user: {
          name: 'João Silva',
          companyName: 'Silva Transportes MEI',
          cnpj: '12.345.678/0001-90',
          regime: 'MEI'
        }
      });
    }, 800);
  });
};