import React, { useState } from 'react';

interface DebugConsoleProps {
  onTriggerEvent: (type: string, payload: any) => void;
}

const DebugConsole: React.FC<DebugConsoleProps> = ({ onTriggerEvent }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-2 left-2 z-[9999] bg-gray-800 text-xs text-green-400 px-2 py-1 rounded opacity-50 hover:opacity-100 font-mono"
      >
        DEV_DEBUG
      </button>
    );
  }

  return (
    <div className="fixed top-2 left-2 z-[9999] bg-gray-900 border border-green-500/30 p-4 rounded shadow-2xl w-64 font-mono text-xs text-green-400">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
        <span className="font-bold">AGENT_DEBUG_CONTROLLER</span>
        <button onClick={() => setIsOpen(false)} className="text-red-400 hover:text-red-300">×</button>
      </div>

      <div className="space-y-2">
        <p className="text-gray-500 uppercase text-[10px]">Simular Eventos Background</p>
        
        <button 
          onClick={() => onTriggerEvent('CAPTURE', { summary: 'Vencimento DAS detectado em e-mail' })}
          className="w-full text-left px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700"
        >
          ► Capture: Tax Found
        </button>

        <button 
          onClick={() => onTriggerEvent('CAPTURE', { summary: 'Padrão de gastos alterado (Combustível)' })}
          className="w-full text-left px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700"
        >
          ► Capture: Anomaly
        </button>

        <p className="text-gray-500 uppercase text-[10px] mt-4">Simular Contexto</p>
        <button 
          onClick={() => onTriggerEvent('CONTEXT_MOVE', { target: 'custom_reports', data: 'Dados do Chat' })}
          className="w-full text-left px-2 py-1 bg-blue-900/30 hover:bg-blue-900/50 rounded border border-blue-800 text-blue-300"
        >
          ► Move Data: Chat -> Widget
        </button>
      </div>
    </div>
  );
};

export default DebugConsole;