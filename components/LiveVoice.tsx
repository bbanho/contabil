import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { MODEL_LIVE } from '../constants';

// --- Encoding/Decoding Utilities (From Example) ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const LiveVoice: React.FC = () => {
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState("Toque para falar");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null); // Keep track to close manually
  
  // Audio Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopSession = () => {
     if(sessionRef.current) {
        // We can't explicitly close the session object in the SDK easily if it's just a promise wrapper 
        // but we can stop sending data and close audio contexts.
        inputAudioContextRef.current?.close();
        outputAudioContextRef.current?.close();
        sessionRef.current = null;
     }
     setActive(false);
     setStatus("Conversa encerrada.");
  };

  const startSession = async () => {
    setActive(true);
    setStatus("Conectando...");
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Init Audio Contexts
    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    inputAudioContextRef.current = inputAudioContext;
    outputAudioContextRef.current = outputAudioContext;
    const outputNode = outputAudioContext.createGain();
    outputNode.connect(outputAudioContext.destination);

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: { width: 320, height: 240 } });
        
        // Setup Video Preview
        if(videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        }

        const sessionPromise = ai.live.connect({
            model: MODEL_LIVE,
            callbacks: {
                onopen: () => {
                    setStatus("Ouvindo... Pode falar.");
                    
                    // Audio Input Stream Setup
                    const source = inputAudioContext.createMediaStreamSource(stream);
                    const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        sessionPromise.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContext.destination);

                    // Video Frame Stream Setup (1 FPS for bandwidth save/simplicity)
                    const interval = setInterval(() => {
                        if (canvasRef.current && videoRef.current) {
                            const ctx = canvasRef.current.getContext('2d');
                            if(ctx) {
                                ctx.drawImage(videoRef.current, 0, 0, 320, 240);
                                const base64 = canvasRef.current.toDataURL('image/jpeg', 0.5).split(',')[1];
                                sessionPromise.then(session => {
                                    session.sendRealtimeInput({ media: { mimeType: 'image/jpeg', data: base64 }});
                                });
                            }
                        }
                    }, 1000); 

                    // Store interval to clear later if needed (omitted for brevity in this snippet)
                },
                onmessage: async (message: LiveServerMessage) => {
                    const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64EncodedAudioString) {
                        const audioBuffer = await decodeAudioData(
                            decode(base64EncodedAudioString),
                            outputAudioContext,
                            24000,
                            1,
                        );
                        const source = outputAudioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputNode);
                        source.addEventListener('ended', () => {
                            sourcesRef.current.delete(source);
                        });
                        
                        // Schedule playback
                        const now = outputAudioContext.currentTime;
                        const startTime = Math.max(nextStartTimeRef.current, now);
                        source.start(startTime);
                        nextStartTimeRef.current = startTime + audioBuffer.duration;
                        sourcesRef.current.add(source);
                    }
                },
                onclose: () => {
                    setStatus("Desconectado.");
                    setActive(false);
                },
                onerror: (e) => {
                    console.error(e);
                    setStatus("Erro na conexão.");
                    setActive(false);
                }
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } // Friendly voice
                },
                systemInstruction: "Você é um contador assistente chamado Amigo. Você conversa com um senhor de idade. Fale de forma clara, pausada e amigável. Você está vendo a câmera dele também. Ajude-o a organizar os papéis."
            }
        });
        sessionRef.current = sessionPromise;

    } catch (e) {
        console.error(e);
        setStatus("Erro ao acessar microfone/câmera.");
        setActive(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-slate-900 text-white rounded-t-3xl mt-4">
      <div className="relative mb-8">
        <video ref={videoRef} className="w-64 h-64 rounded-full object-cover border-4 border-blue-500 shadow-2xl" muted />
        <canvas ref={canvasRef} width="320" height="240" className="hidden" />
        {active && (
            <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping opacity-75"></div>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-4">{status}</h2>
      
      {!active ? (
          <button 
            onClick={startSession}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg transition transform hover:scale-105 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
            </svg>
            Iniciar Conversa
          </button>
      ) : (
          <button 
            onClick={stopSession}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg"
          >
            Desligar
          </button>
      )}
      
      <p className="mt-6 text-slate-400 text-center max-w-xs">
        Fale como se estivesse em uma chamada de vídeo com seu contador. Eu posso ver o que você mostra na câmera.
      </p>
    </div>
  );
};

export default LiveVoice;
