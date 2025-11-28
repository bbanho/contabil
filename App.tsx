import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppNotification, DetectedIntent, UserProfile } from './types';
import Dashboard from './components/Dashboard';
import DocumentUploader from './components/DocumentUploader';
import ChatAdvisor from './components/ChatAdvisor';
import SmartInput from './components/SmartInput';
import { getOfficialFeed, mockOAuthLogin } from './services/officialData';
import { deduceUserIntent } from './services/geminiService';
import { getProfile, getDocuments } from './services/storageService';

const App: React.FC = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<'dashboard' | 'docs' | 'settings'>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  // Data State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notification, setNotification] = useState<AppNotification | null>(null);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  // Rage Click Detection
  const clickHistory = useRef<number[]>([]);
  const handleGlobalClick = () => {
    const now = Date.now();
    clickHistory.current.push(now);
    clickHistory.current = clickHistory.current.filter(t => now - t < 1000); // Keep last 1 second
    if (clickHistory.current.length > 4) {
      setNotification({
        id: 'rage-click',
        message: 'Parece que você está com dificuldades. Quer falar com o assistente?',
        type: 'alert',
        actionLabel: 'Abrir Chat',
        onAction: () => setDrawerOpen(true)
      });
      clickHistory.current = []; // Reset
    }
  };

  useEffect(() => {
    // Initial Data Load simulation
    const loadData = async () => {
      const storedProfile = getProfile();
      // If valid profile exists (has company name), use it, else do mock login
      if (storedProfile.companyName) {
         setProfile(storedProfile);
      } else {
         const data = await mockOAuthLogin();
         setProfile(data.user);
      }
    };
    loadData();

    // Responsive check
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Voice/Intent Logic
  const handleVoiceCommand = async (transcript: string) => {
    setIsProcessingVoice(true);
    const intent: DetectedIntent = await deduceUserIntent(transcript);
    setIsProcessingVoice(false);

    if (intent.confidence > 0.6) {
      // Create a proposal notification
      setNotification({
        id: Date.now().toString(),
        message: intent.summary,
        type: 'proposal',
        actionLabel: 'Executar',
        onAction: () => {
          // Route based on intent
          if (intent.type === 'NAVIGATE') {
             if (intent.payload?.target?.includes('doc')) setCurrentView('docs');
             if (intent.payload?.target?.includes('dash')) setCurrentView('dashboard');
          } else if (intent.type === 'QUERY_TAX') {
             setDrawerOpen(true);
             // In a real app, we would inject the query into the chat here
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
    <div onClick={handleGlobalClick} className="min-h-screen bg-slate-100 flex font-sans text-slate-900 overflow-hidden">
      
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
              label="Painel Principal" 
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
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
        
        {/* User Info / Logout */}
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
           <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
           </button>
           <span className="font-bold text-slate-800">Contábil</span>
           <button onClick={() => setDrawerOpen(true)} className="text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
           </button>
        </header>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto bg-slate-100 relative">
          {currentView === 'dashboard' && profile && <Dashboard profile={profile} documents={getDocuments()} feed={getOfficialFeed()} />}
          {currentView === 'docs' && <DocumentUploader />}
          {currentView === 'settings' && (
             <div className="p-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Configurações da Conta</h2>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
                   <SmartInput label="Nome Fantasia" value={profile?.companyName || ''} onChange={() => {}} onVoiceInput={handleVoiceCommand} />
                   <SmartInput label="CNPJ" value={profile?.cnpj || ''} onChange={() => {}} />
                   <div className="pt-4 border-t border-slate-100">
                      <label className="flex items-center gap-2 cursor-pointer">
                         <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600 rounded" defaultChecked />
                         <span className="text-sm text-slate-700">Permitir análise automática de documentos</span>
                      </label>
                   </div>
                </div>
             </div>
          )}
        </div>

        {/* Floating Action Button (Desktop Only - discreet) */}
        <div className="hidden md:block absolute bottom-8 right-8">
           <button 
             onClick={() => setDrawerOpen(true)}
             className="bg-slate-900 hover:bg-slate-800 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-105"
             title="Assistente IA"
           >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
           </button>
        </div>

        {/* Notification Toast */}
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
          <div className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 transform transition-transform flex flex-col border-l border-slate-200">
             <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-700">Assistente Contábil</h3>
                <button onClick={() => setDrawerOpen(false)} className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-100 text-slate-500">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
             <div className="flex-1 overflow-hidden">
                <ChatAdvisor />
             </div>
             {/* Contextual Action Buttons in Drawer */}
             <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-2">
                <button className="text-xs bg-white border border-slate-300 p-2 rounded text-slate-600 hover:border-blue-500 hover:text-blue-600">Consultar Lei 123</button>
                <button className="text-xs bg-white border border-slate-300 p-2 rounded text-slate-600 hover:border-blue-500 hover:text-blue-600">Recalcular DAS</button>
             </div>
          </div>
        </>
      )}

      {/* Loading Overlay */}
      {isProcessingVoice && (
         <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
            <span className="text-sm font-medium">Analisando...</span>
         </div>
      )}
    </div>
  );
};

export default App;