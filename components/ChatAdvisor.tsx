import React, { useState, useRef, useEffect } from 'react';
import { askAdvisor } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatAdvisor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Olá! Sou seu contador amigo. Como posso ajudar com seus negócios hoje? Quer saber sobre impostos, MEI, ou analisar suas contas?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
        // Determine if we need search based on keywords (naive but effective for this demo)
        const needsSearch = /imposto|lei|prazo|receita federal|alíquota|2024|2025/i.test(userMsg.text);
        
        const history = messages.map(m => ({ role: m.role, text: m.text }));
        
        const response = await askAdvisor(history, userMsg.text, needsSearch);
        
        const botMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: response.text || "Desculpe, não entendi.",
            sources: response.grounding?.map((g: any) => ({ uri: g.web?.uri || g.maps?.uri, title: g.web?.title || g.maps?.title })).filter((s: any) => s.uri)
        };
        
        setMessages(prev => [...prev, botMsg]);
    } catch (error) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Tive um problema de conexão. Podemos tentar de novo?" }]);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-lg ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-slate-800 rounded-bl-none shadow-sm'}`}>
              <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-sm">
                  <p className="font-bold text-gray-500 mb-1">Fontes:</p>
                  <ul className="list-disc pl-4">
                    {msg.sources.map((s, idx) => (
                      <li key={idx}>
                        <a href={s.uri} target="_blank" rel="noreferrer" className="text-blue-500 underline truncate block max-w-xs">{s.title || s.uri}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                <span className="text-sm text-gray-500 ml-2">Pensando...</span>
             </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
            <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Pergunte sobre notas, impostos..."
                className="flex-1 border border-gray-300 rounded-full px-6 py-3 text-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-blue-600 text-white p-4 rounded-full hover:bg-blue-700 disabled:opacity-50 transition"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAdvisor;
