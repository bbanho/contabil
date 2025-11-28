import React, { useState, useRef } from 'react';
import { analyzeDocumentImage } from '../services/geminiService';
import { saveDocument } from '../services/storageService';
import { FinDocument, DocType } from '../types';

const DocumentUploader: React.FC = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<Partial<FinDocument> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      processFile(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const processFile = async (base64Data: string, mimeType: string) => {
    setAnalyzing(true);
    try {
      // Strip header for API
      const base64Content = base64Data.split(',')[1];
      const analysis = await analyzeDocumentImage(base64Content, mimeType);
      
      const newDoc: FinDocument = {
        id: Date.now().toString(),
        name: analysis.merchant || "Documento Sem Nome",
        type: analysis.docType || DocType.UNKNOWN,
        date: analysis.date || new Date().toISOString().split('T')[0],
        amount: analysis.amount || 0,
        tags: analysis.tags || [],
        summary: analysis.summary || "Sem resumo disponível",
        alerts: analysis.alerts || [],
        imageUrl: base64Data
      };
      
      setResult(newDoc);
      saveDocument(newDoc);
    } catch (err) {
      console.error(err);
      alert("Não consegui ler o documento. Tente uma foto mais clara.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-4 flex flex-col h-full">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Adicionar Documento</h2>
      
      {!preview ? (
        <div className="flex-1 flex flex-col justify-center items-center space-y-6">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-64 h-64 bg-blue-50 border-4 border-dashed border-blue-300 rounded-3xl flex flex-col items-center justify-center hover:bg-blue-100 transition shadow-inner"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 text-blue-500 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
            <span className="text-xl font-semibold text-blue-700">Tirar Foto / Upload</span>
            <span className="text-sm text-blue-500 mt-2">PDF ou Imagem</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,application/pdf"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
           {/* Preview Card */}
           <div className="w-full bg-white rounded-xl shadow p-4">
              <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg mb-4" />
              
              {analyzing && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-lg text-slate-600 animate-pulse">Lendo seu documento...</p>
                  <p className="text-sm text-slate-400">Estou usando meus "óculos digitais"</p>
                </div>
              )}

              {!analyzing && result && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">✅</span>
                    <h3 className="font-bold text-xl text-green-800">Leitura Concluída!</h3>
                  </div>
                  <div className="space-y-2 text-slate-700">
                    <p><strong>Tipo:</strong> {result.type}</p>
                    <p><strong>Valor:</strong> R$ {result.amount?.toFixed(2)}</p>
                    <p><strong>Data:</strong> {result.date}</p>
                    <p><strong>Resumo:</strong> {result.summary}</p>
                    {result.alerts && result.alerts.length > 0 && (
                      <div className="mt-2 p-2 bg-red-100 rounded text-red-800 text-sm font-bold">
                        {result.alerts.join(', ')}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => { setPreview(null); setResult(null); }}
                    className="mt-4 w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700"
                  >
                    Novo Documento
                  </button>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;
