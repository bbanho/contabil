import React, { useState } from 'react';
import { OFFICIAL_CALENDAR, SECTOR_EXPENSES, REVENUE_PROJECTION } from '../services/mockData';
import { WidgetConfig } from '../types';
import { BarChart, Bar, LineChart, Line, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AVAILABLE_WIDGETS: WidgetConfig[] = [
  { id: 'w1', type: 'calendar_official', title: 'Agenda Oficial (RFB)', w: 2, h: 2 },
  { id: 'w2', type: 'revenue_projection', title: 'Projeção de Caixa', w: 2, h: 1 },
  { id: 'w3', type: 'sector_expenses', title: 'Gastos por Setor', w: 1, h: 1 },
  { id: 'w4', type: 'tax_summary', title: 'Resumo Tributário', w: 1, h: 1 },
];

const CustomReports: React.FC = () => {
  const [activeWidgets, setActiveWidgets] = useState<string[]>(['w1', 'w2', 'w3']);
  const [isEditing, setIsEditing] = useState(false);

  const toggleWidget = (id: string) => {
    setActiveWidgets(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  const renderWidgetContent = (type: string) => {
    switch (type) {
      case 'calendar_official':
        return (
          <div className="space-y-3">
            {OFFICIAL_CALENDAR.slice(0, 3).map(evt => (
               <div key={evt.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded border border-slate-100">
                  <div className={`p-2 rounded text-center min-w-[3rem] ${evt.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    <div className="text-xs font-bold uppercase">{new Date(evt.date).toLocaleString('pt-BR', {month: 'short'})}</div>
                    <div className="text-lg font-bold">{new Date(evt.date).getDate()}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{evt.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{evt.description}</p>
                    {evt.amount && <p className="text-xs font-mono font-bold text-slate-900 mt-1">R$ {evt.amount.toFixed(2)}</p>}
                  </div>
               </div>
            ))}
          </div>
        );
      case 'revenue_projection':
        return (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={REVENUE_PROJECTION}>
              <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="real" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} name="Realizado" />
              <Line type="monotone" dataKey="projected" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Projeção" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'sector_expenses':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={SECTOR_EXPENSES}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {SECTOR_EXPENSES.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'tax_summary':
          return (
              <div className="text-center py-6">
                  <div className="text-3xl font-bold text-slate-800">R$ 485,20</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Total Impostos (Mês)</div>
                  <div className="mt-4 flex justify-center gap-2">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Em dia</span>
                  </div>
              </div>
          );
      default:
        return <div className="text-slate-400 text-sm">Carregando dados...</div>;
    }
  };

  return (
    <div className="p-6 md:p-10 animate-fade-in pb-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meus Relatórios</h1>
          <p className="text-slate-500 text-sm">Organize as informações oficiais e seus indicadores.</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${isEditing ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
        >
          {isEditing ? 'Concluir Edição' : 'Personalizar Painel'}
        </button>
      </div>

      {isEditing && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl">
           <h3 className="text-sm font-bold text-blue-800 mb-3">Widgets Disponíveis</h3>
           <div className="flex flex-wrap gap-2">
             {AVAILABLE_WIDGETS.map(w => (
               <button
                 key={w.id}
                 onClick={() => toggleWidget(w.id)}
                 className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${activeWidgets.includes(w.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'}`}
               >
                 {activeWidgets.includes(w.id) ? '✓ ' : '+ '}{w.title}
               </button>
             ))}
           </div>
           <p className="text-xs text-blue-600 mt-2">O assistente não pode alterar este layout. Você está no controle.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AVAILABLE_WIDGETS.filter(w => activeWidgets.includes(w.id)).map(widget => (
          <div 
            key={widget.id} 
            className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col ${widget.w === 2 ? 'md:col-span-2' : ''}`}
          >
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <span className="font-bold text-slate-700 text-sm">{widget.title}</span>
              {isEditing && (
                <button onClick={() => toggleWidget(widget.id)} className="text-red-400 hover:text-red-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
            <div className="p-4 flex-1">
              {renderWidgetContent(widget.type)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomReports;