
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { AgentIdentity } from '../types';

interface Props {
  identity: AgentIdentity;
  onClose: () => void;
  onMemoryCapture: (content: string) => void;
}

const LiveVoice: React.FC<Props> = ({ identity, onClose, onMemoryCapture }) => {
  const [status, setStatus] = useState<'connecting' | 'listening' | 'speaking' | 'idle'>('connecting');
  const [transcription, setTranscription] = useState('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    initLiveSession();
    return () => {
      if (sessionRef.current) sessionRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
      if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    };
  }, []);

  const initLiveSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('listening');
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => prev + message.serverContent!.outputTranscription!.text);
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              setStatus('speaking');
              await playAudio(audioData);
            }

            if (message.serverContent?.turnComplete) {
              setStatus('listening');
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live Error:', e);
            setStatus('idle');
          },
          onclose: () => setStatus('idle'),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: identity.voice } },
          },
          systemInstruction: `You are ${identity.name}. Personality: ${identity.personality}. You are in a real-time voice call with the user. Keep your responses brief and natural, like a conversation.`,
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to init live session:', err);
    }
  };

  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) int16[i] = data[i] * 32768;
    return {
      data: btoa(String.fromCharCode(...new Uint8Array(int16.buffer))),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const playAudio = async (base64: string) => {
    if (!outputAudioContextRef.current) return;
    
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = outputAudioContextRef.current.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

    const source = outputAudioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(outputAudioContextRef.current.destination);
    
    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += buffer.duration;
    
    sourcesRef.current.add(source);
    source.onended = () => sourcesRef.current.delete(source);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute top-8 right-8">
        <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all group">
          <svg className="w-6 h-6 text-white/50 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="relative mb-12">
        <div className={`w-64 h-64 rounded-full bg-indigo-500/20 flex items-center justify-center transition-all duration-700 ${status === 'speaking' ? 'scale-110' : 'scale-100'}`}>
          <div className={`w-48 h-48 rounded-full bg-indigo-500/30 flex items-center justify-center transition-all duration-500 ${status === 'speaking' ? 'scale-110 blur-xl' : 'blur-lg'}`} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-[0_0_50px_rgba(99,102,241,0.5)] flex items-center justify-center`}>
              {status === 'connecting' ? (
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <div className="flex gap-1.5 items-end h-8">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div 
                      key={i} 
                      className={`w-1.5 bg-white rounded-full transition-all duration-300 ${status === 'speaking' ? 'animate-bounce' : 'h-1'}`}
                      style={{ height: status === 'speaking' ? `${30 + Math.random() * 70}%` : '4px', animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center max-w-lg">
        <h2 className="text-3xl font-bold font-outfit mb-2 gradient-text">{identity.name}</h2>
        <p className="text-sm font-medium tracking-widest text-white/40 uppercase mb-8">
          {status === 'connecting' ? 'Establishing secure link...' : status === 'listening' ? 'Listening to your environment' : status === 'speaking' ? `${identity.name} is speaking` : 'Connection Idle'}
        </p>
        
        <div className="min-h-[60px] glass p-6 rounded-2xl border border-white/5 text-center text-white/80 italic font-light text-lg">
          {transcription || "Say something to your home agent..."}
        </div>
      </div>

      <div className="mt-auto pb-12">
         <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/40 tracking-widest uppercase">
              End-to-End Encrypted
            </div>
         </div>
      </div>
    </div>
  );
};

export default LiveVoice;
