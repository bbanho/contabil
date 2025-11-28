import React from 'react';

interface AssistantBarProps {
  onOpenAssistant: () => void;
  currentView: string;
}

const AssistantBar: React.FC<AssistantBarProps> = ({ onOpenAssistant, currentView }) => {
  const getContextButtons = () => {
    switch(currentView) {
      case 'dashboard':
        return [
          { label: 'Resumo Diário', icon: '📅' },
          { label: 'Ver Pendências', icon: '⚠️' }
        ];
      case 'reports':
        return [
          { label: 'Exportar PDF', icon: '📄' },
          { label: 'Analisar Tendência', icon: '📈' }
        ];
      case 'docs':
        return [
          { label: 'Digitalizar Lote', icon: '📸' },
          { label: 'Buscar Antigos', icon: '🔍' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-6 px-4 pointer-events-none">
      <div className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-2xl rounded-2xl p-2 flex items-center gap-3 pointer-events-auto transform transition-all hover:scale-[1.02]">
        
        {/* Context Actions */}
        <div className="flex gap-2 mr-2">
          {getContextButtons().map((btn, idx) => (
            <button 
              key={idx}
              className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors flex items-center gap-2"
            >
              <span>{btn.icon}</span>
              <span className="hidden sm:inline">{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Main Trigger */}
        <button 
          onClick={onOpenAssistant}
          className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors relative group"
        >
          <span className="text-xl font-bold">?</span>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Ajuda & IA
          </span>
        </button>

      </div>
    </div>
  );
};

export default AssistantBar;