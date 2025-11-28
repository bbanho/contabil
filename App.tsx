import React, { useState, useEffect, useRef } from 'react';
import { AppNotification, DetectedIntent, UserProfile } from './types';
import Dashboard from './components/Dashboard';
import DocumentUploader from './components/DocumentUploader';
import ChatAdvisor from './components/ChatAdvisor';
import SmartInput from './components/SmartInput';
import DebugConsole from './components/DebugConsole'; // New
import AssistantBar from './components/AssistantBar'; // New
import CustomReports from './components/CustomReports'; // New
import { getOfficialFeed, mockOAuthLogin } from './services/mockData';
import { deduceUserIntent } from './services/geminiService';
import { getProfile, getDocuments } from './services/storageService';

const App: React.FC = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<'dashboard' | 'docs' | 'settings' | 'reports'>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  // Data State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notification, setNotification] = useState<AppNotification | null>(null);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  // Debug State
  const [agentCapturedInfo, setAgentCapturedInfo] = useState<string | null>(null);

  // Rage Click Detection
  const clickHistory = useRef<number[]>([]);
  const handleGlobalClick = () => {
    const now = Date.now();
    clickHistory.current.push(now);
    clickHistory.current = clickHistory.current.filter(t => now - t < 1000); 
    if (clickHistory.current.length > 5) { // Increased threshold slightly
      setNotification({
        id: 'rage-click',
        message: 'Parece que você está com dificuldades. Quer falar com o assistente?',
        type: 'alert',
        actionLabel: 'Abrir Chat',
        onAction: () => setDrawerOpen(true)
      });
      clickHistory.current = [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const storedProfile = getProfile();
      if (storedProfile.companyName) {
         setProfile(storedProfile);
      } else {
         const data = await mockOAuthLogin();
         setProfile(data.user);
      }
    };
    loadData();

    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Debug Event Handler
  const handleDebugTrigger = (type: string, payload: any) => {
    if (type === 'CAPTURE') {
       // Show the "Agent Capture" Debug Popup
       setAgentCapturedInfo(payload.summary);
       // Auto-hide after 4 seconds
       setTimeout(() => setAgentCapturedInfo(null), 4000);
    } else if (type === 'CONTEXT_MOVE') {
       setNotification({
          id: Date.now().toString(),
          message: 'O assistente encontrou dados financeiros no chat. Deseja criar um widget?',
          type: 'proposal',
          actionLabel: 'Criar Widget',
          onAction: () => setCurrentView('reports')
       });
    }
  };

  const handleVoiceCommand = async (transcript: string) => {
    setIsProcessingVoice(true);
    const intent: DetectedIntent = await deduceUserIntent(transcript);
    setIsProcessingVoice(false);

    if (intent.confidence > 0.6) {
      setNotification({
        id: Date.now().toString(),
        message: intent.summary,
        type: 'proposal',
        actionLabel: 'Executar',
        onAction: () => {
          if (intent.type === 'NAVIGATE') {
             if (intent.payload?.target?.includes('doc')) setCurrentView('docs');
             if (intent.payload?.target?.includes('dash')) setCurrentView('dashboard');
             if (intent.payload?.target?.includes('rep')) setCurrentView('reports');
          } else if (intent.type === 'QUERY_TAX') {
             setDrawerOpen(true);
          }
          setNotification(null);
        }
      });
    }
  };

  const NavItem = ({ view, label, icon }: any) => (
    <button
      onClick={() => { setCurrentView(view); if(window.innerWidth < 768) setSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${currentView === view ? 'bg-slate-800 text-white border-r-4 border-blue-500' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div onClick={handleGlobalClick} className="min-h-screen bg-slate-100 flex font-sans text-slate-900 overflow-hidden relative">
      
      <DebugConsole onTriggerEvent={handleDebugTrigger} />

      {/* Agent Capture Debug Popup */}
      {agentCapturedInfo && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-slate-800 text-green-400 px-4 py-2 rounded shadow-xl border border-green-500/30 font-mono text-xs flex items-center gap-2 animate-bounce-short">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span>AGENT_BG_CAPTURE: {agentCapturedInfo}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative z-30 h-full bg-slate-900 w-64 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20 lg:w-64'} flex flex-col justify-between shadow-2xl`}>
        <div>
          <div className="h-16 flex items-center justify-center border-b border-slate-800">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">C</div>
             <span className={`ml-3 font-semibold text-white tracking-wide ${!isSidebarOpen && 'md:hidden lg:block'}`}>CONTÁBIL</span>
          </div>
          <nav className="mt-6 space-y-1">
            <NavItem 
              view="dashboard" 
              label="Visão Geral" 
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
            />
            <NavItem 
              view="reports" 
              label="Relatórios & Widgets" 
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            />
            <NavItem 
              view="docs" 
              label="Documentação" 
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            />
            <NavItem 
              view="settings" 
              label="Configurações" 
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            />
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-800">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                 {profile?.name.charAt(0) || 'U'}
              </div>
              <div className={`overflow-hidden ${!isSidebarOpen && 'md:hidden lg:block'}`}>
                 <p className="text-sm font-medium text-white truncate w-32">{profile?.name}</p>
                 <button className="text-xs text-slate-400 hover:text-white">Sair</button>
              </div>
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
           <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
           </button>
           <span className="font-bold text-slate-800">Contábil</span>
           <button onClick={() => setDrawerOpen(true)} className="text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
           </button>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-100 relative scroll-smooth">
          {currentView === 'dashboard' && profile && <Dashboard profile={profile} documents={getDocuments()} feed={getOfficialFeed()} />}
          {currentView === 'reports' && <CustomReports />}
          {currentView === 'docs' && <DocumentUploader />}
          {currentView === 'settings' && (
             <div className="p-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Configurações</h2>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
                   <SmartInput label="Nome Fantasia" value={profile?.companyName || ''} onChange={() => {}} onVoiceInput={handleVoiceCommand} />
                   <SmartInput label="CNPJ" value={profile?.cnpj || ''} onChange={() => {}} />
                </div>
             </div>
          )}
        </div>

        {/* Assistant Floating Bar (Replaces floating button) */}
        {!isDrawerOpen && <AssistantBar currentView={currentView} onOpenAssistant={() => setDrawerOpen(true)} />}

        {notification && (
           <div className="absolute top-6 right-6 md:right-10 z-50 animate-slide-in">
              <div className="bg-white border-l-4 border-blue-500 shadow-xl rounded-r-lg p-4 max-w-sm flex flex-col gap-2">
                 <div className="flex justify-between items-start">
                    <p className="text-slate-800 font-medium text-sm">{notification.message}</p>
                    <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">×</button>
                 </div>
                 {notification.actionLabel && (
                    <div className="flex justify-end mt-2">
                       <button 
                         onClick={notification.onAction}
                         className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded transition-colors"
                       >
                          {notification.actionLabel}
                       </button>
                    </div>
                 )}
              </div>
           </div>
        )}
      </main>

      {/* Right Drawer (Chat/Assistant) */}
      {isDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm transition-opacity" onClick={() => setDrawerOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 transform transition-transform flex flex-col border-l border-slate-200 animate-slide-in-right">
             <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Assistente Contábil
                </h3>
                <button onClick={() => setDrawerOpen(false)} className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-100 text-slate-500">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
             <div className="flex-1 overflow-hidden">
                <ChatAdvisor />
             </div>
             <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-2">
                <button className="text-xs bg-white border border-slate-300 p-2 rounded text-slate-600 hover:border-blue-500 hover:text-blue-600">Consultar Lei 123</button>
                <button className="text-xs bg-white border border-slate-300 p-2 rounded text-slate-600 hover:border-blue-500 hover:text-blue-600">Recalcular DAS</button>
             </div>
          </div>
        </>
      )}

      {isProcessingVoice && (
         <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-3">
            <span className="text-sm font-medium">Analisando...</span>
         </div>
      )}
    </div>
  );
};

export default App;