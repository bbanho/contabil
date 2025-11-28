import { CalendarEvent } from '../types';

// Simulated database of official obligations
export const OFFICIAL_CALENDAR: CalendarEvent[] = [
  {
    id: 'das-mei-current',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 20).toISOString().split('T')[0],
    title: 'Vencimento DAS-MEI',
    description: 'Guia de pagamento mensal obrigatória para Microempreendedores Individuais.',
    priority: 'high',
    type: 'tax'
  },
  {
    id: 'irpf-start',
    date: '2024-03-15',
    title: 'Início Declaração IRPF',
    description: 'Abertura do prazo para entrega da Declaração de Imposto de Renda Pessoa Física.',
    priority: 'medium',
    type: 'admin'
  },
  {
    id: 'nfe-emission',
    date: new Date().toISOString().split('T')[0],
    title: 'Obrigação Acessória: Emissão de Notas',
    description: 'Lembre-se de emitir notas para serviços prestados a pessoas jurídicas.',
    priority: 'low',
    type: 'admin'
  }
];

export const getOfficialFeed = (): CalendarEvent[] => {
  // logic to filter by date would go here
  return OFFICIAL_CALENDAR;
};

export const mockOAuthLogin = async (): Promise<{ token: string, user: any }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        token: 'oauth_mock_token_123',
        user: {
          name: 'João Silva',
          companyName: 'Silva Transportes Ltda',
          cnpj: '12.345.678/0001-90',
          regime: 'MEI'
        }
      });
    }, 1500);
  });
};
