import React, { useState } from 'react';
import { UserProfile, CalendarEvent, FinDocument } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { SECTOR_EXPENSES } from '../services/mockData';

interface DashboardProps {
  profile: UserProfile;
  documents: FinDocument[];
  feed: CalendarEvent[];
}

const Dashboard: React.FC<DashboardProps> = ({ profile, documents, feed }) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleCard = (id: string) => {
    setExpandedCard(prev => prev === id ? null : id);
  };

  const chartData = documents.reduce((acc: any[], doc) => {
    const existing = acc.find(i => i.name === doc.type);
    if (existing) existing.value += doc.amount;
    else acc.push({ name: doc.type, value: doc.amount });
    return acc;
  }, []);

  return (
    <div className="p-6 md:p-10 space-y-8 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Visão Geral</h1>
          <p className="text-slate-500 mt-1">Olá, {profile.name}. <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold ml-2">CNPJ Ativo</span></p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col items-end">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Regime Tributário</span>
            <div className="text-slate-800 font-semibold">{profile.regime}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Feed Card - "Official Data" */}
        <div 
          onClick={() => toggleCard('feed')}
          className={`md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer transition-all duration-300 ${expandedCard === 'feed' ? 'ring-2 ring-blue-500 shadow-md transform scale-[1.01]' : 'hover:shadow-md'}`}
        >
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="font-bold text-slate-700 flex items-center gap-2">
              Agenda Oficial (Receita Federal)
              {expandedCard === 'feed' ? (
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
              ) : (
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              )}
            </h2>
            <div className="flex gap-2">
                 <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 animate-pulse"></span>
                 <span className="text-xs text-slate-500 font-medium">Sincronizado</span>
            </div>
          </div>
          <div className="p-0">
            {feed.map(event => (
              <div key={event.id} className="p-6 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors flex items-start gap-4 cursor-pointer group">
                <div className={`flex-shrink-0 w-12 h-12 rounded flex flex-col items-center justify-center border transition-colors ${event.priority === 'high' ? 'bg-red-50 border-red-200 text-red-700 group-hover:bg-red-100' : 'bg-blue-50 border-blue-200 text-blue-700 group-hover:bg-blue-100'}`}>
                   <span className="text-xs font-bold uppercase">{new Date(event.date).toLocaleString('pt-BR', { month: 'short' })}</span>
                   <span className="text-xl font-bold leading-none">{new Date(event.date).getDate()}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                     <h3 className="font-semibold text-slate-800">{event.title}</h3>
                     {event.amount && <span className="text-sm font-bold text-slate-600">R$ {event.amount.toFixed(2)}</span>}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Detailed Section */}
          <div className={`bg-slate-50 border-t border-slate-200 transition-all duration-300 overflow-hidden ${expandedCard === 'feed' ? 'max-h-96 opacity-100 p-6' : 'max-h-0 opacity-0 p-0'}`}>
             <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">Status da Conexão</h3>
             <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-4">
                <div>
                   <p className="font-semibold text-slate-800">Fonte de Dados</p>
                   <p>API eCAC / Receita Federal (Simulado)</p>
                </div>
                <div>
                   <p className="font-semibold text-slate-800">Certificado Digital</p>
                   <p className="text-green-600">Válido (A1) até 12/2025</p>
                </div>
                <div>
                   <p className="font-semibold text-slate-800">Última Varredura</p>
                   <p>Hoje, às 08:30</p>
                </div>
                <div>
                   <p className="font-semibold text-slate-800">Pendências</p>
                   <p>Nenhuma pendência bloqueante.</p>
                </div>
             </div>
             <div className="bg-blue-100 text-blue-800 p-3 rounded font-mono text-xs">
                GET /api/v1/tax-calendar?cnpj={profile.cnpj} [200 OK]
             </div>
          </div>
        </div>

        {/* Expenses by Sector (Pie Chart) */}
        <div 
          onClick={() => toggleCard('sectors')}
          className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col cursor-pointer transition-all duration-300 ${expandedCard === 'sectors' ? 'ring-2 ring-blue-500 shadow-md transform scale-[1.01]' : 'hover:shadow-md'}`}
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="font-bold text-slate-700">Despesas por Setor</h2>
              <p className="text-xs text-slate-400">Baseado nas notas fiscais.</p>
            </div>
            {expandedCard === 'sectors' ? (
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
              ) : (
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            )}
          </div>
          
          <div className="flex-1 min-h-[200px] relative">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                    data={SECTOR_EXPENSES}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                 >
                    {SECTOR_EXPENSES.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                 </Pie>
                 <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <span className="text-xs font-bold text-slate-400">DISTRIBUIÇÃO</span>
             </div>
          </div>
          
          {/* Expanded Table */}
          <div className={`mt-4 transition-all duration-300 overflow-hidden ${expandedCard === 'sectors' ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
             <div className="border-t border-slate-100 pt-4">
                <table className="w-full text-xs text-left">
                   <thead>
                      <tr className="text-slate-500 border-b border-slate-100">
                         <th className="pb-2">Categoria</th>
                         <th className="pb-2 text-right">Valor</th>
                      </tr>
                   </thead>
                   <tbody>
                      {SECTOR_EXPENSES.map((sector, i) => (
                         <tr key={i} className="border-b border-slate-50 last:border-0">
                            <td className="py-2 flex items-center gap-2">
                               <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sector.color }}></span>
                               <span className="text-slate-700 font-medium">{sector.name}</span>
                            </td>
                            <td className="py-2 text-right font-mono text-slate-600">
                               R$ {sector.value.toFixed(2)}
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
          
          {/* Collapsed Legend (Only show if not expanded to save space, or keep both? Keeping both for transition smoothness) */}
          <div className={`mt-4 flex flex-wrap gap-2 justify-center transition-opacity duration-300 ${expandedCard === 'sectors' ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
             {SECTOR_EXPENSES.map((sector, i) => (
                 <div key={i} className="flex items-center gap-1.5">
                     <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sector.color }}></span>
                     <span className="text-xs text-slate-600">{sector.name}</span>
                 </div>
             ))}
          </div>
        </div>
      </div>
      
      {/* Monthly Movement Bar Chart */}
      <div 
        onClick={() => toggleCard('movement')}
        className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer transition-all duration-300 ${expandedCard === 'movement' ? 'ring-2 ring-blue-500 shadow-md transform scale-[1.01]' : 'hover:shadow-md'}`}
      >
        <div className="flex justify-between items-start mb-6">
            <h2 className="font-bold text-slate-700">Volume de Processamento de Documentos</h2>
            {expandedCard === 'movement' ? (
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
            ) : (
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            )}
        </div>
        
        <div className="h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '4px', color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
               </BarChart>
             </ResponsiveContainer>
        </div>

        {/* Expanded Details for Movement */}
        <div className={`bg-slate-50 border-t border-slate-200 mt-6 transition-all duration-300 overflow-hidden ${expandedCard === 'movement' ? 'max-h-64 opacity-100 p-4 rounded-lg' : 'max-h-0 opacity-0 p-0'}`}>
             <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Detalhamento dos Documentos</h3>
             {chartData.length > 0 ? (
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {chartData.map((item, idx) => (
                        <div key={idx} className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                            <p className="text-xs text-slate-400 mb-1">{item.name}</p>
                            <p className="text-lg font-bold text-slate-800">R$ {item.value.toFixed(2)}</p>
                        </div>
                    ))}
                 </div>
             ) : (
                 <p className="text-sm text-slate-500 italic">Nenhum documento processado neste período.</p>
             )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;