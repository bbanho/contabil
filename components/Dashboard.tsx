import React from 'react';
import { UserProfile, CalendarEvent, FinDocument } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DashboardProps {
  profile: UserProfile;
  documents: FinDocument[];
  feed: CalendarEvent[];
}

const Dashboard: React.FC<DashboardProps> = ({ profile, documents, feed }) => {
  const chartData = documents.reduce((acc: any[], doc) => {
    const existing = acc.find(i => i.name === doc.type);
    if (existing) existing.value += doc.amount;
    else acc.push({ name: doc.type, value: doc.amount });
    return acc;
  }, []);

  return (
    <div className="p-6 md:p-10 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Visão Geral</h1>
          <p className="text-slate-500 mt-1">Status Contábil: <span className="text-green-600 font-semibold">Regular</span></p>
        </div>
        <div className="mt-4 md:mt-0 bg-blue-50 text-blue-800 px-4 py-2 rounded border border-blue-100 text-sm font-medium">
          {profile.companyName} ({profile.regime})
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Feed Card - "Official Data" */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="font-bold text-slate-700">Agenda Oficial & Obrigações</h2>
            <span className="text-xs uppercase bg-slate-200 text-slate-600 px-2 py-1 rounded">Receita Federal</span>
          </div>
          <div className="p-0">
            {feed.map(event => (
              <div key={event.id} className="p-6 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors flex items-start gap-4 cursor-pointer">
                <div className={`flex-shrink-0 w-12 h-12 rounded flex flex-col items-center justify-center border ${event.priority === 'high' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                   <span className="text-xs font-bold uppercase">{new Date(event.date).toLocaleString('pt-BR', { month: 'short' })}</span>
                   <span className="text-xl font-bold leading-none">{new Date(event.date).getDate()}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{event.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <h2 className="font-bold text-slate-700 mb-6">Movimentação Mensal</h2>
          <div className="flex-1 min-h-[200px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" hide />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '4px', color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
             <div className="flex justify-between items-center">
                <span className="text-slate-500">Total Processado</span>
                <span className="text-xl font-bold text-slate-900">
                   R$ {documents.reduce((s, d) => s + d.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
