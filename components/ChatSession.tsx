
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { AgentIdentity, ChatMessage } from '../types';
import { Icons } from '../constants';

interface Props {
  identity: AgentIdentity;
  addMemory: (content: string, category: 'user_preference' | 'fact' | 'note' | 'code_snippet' | 'learning' | 'motivation') => void;
  addTask: (title: string, category: 'business' | 'personal' | 'coding', priority: 'low' | 'medium' | 'high') => void;
}

const ChatSession: React.FC<Props> = ({ identity, addMemory, addTask }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [visionMode, setVisionMode] = useState<'none' | 'camera' | 'screen'>('none');
  const [previewFrame, setPreviewFrame] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const toggleVision = async (type: 'camera' | 'screen') => {
    if (visionMode === type) {
      setVisionMode('none');
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
      return;
    }

    try {
      const stream = type === 'camera' 
        ? await navigator.mediaDevices.getUserMedia({ video: true })
        : await navigator.mediaDevices.getDisplayMedia({ video: true });
      
      setVisionMode(type);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Vision access error:', err);
      alert('Aura requires permission to access hardware vision.');
    }
  };

  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const handleSend = async () => {
    if (!input.trim() && !visionMode) return;
    if (isLoading) return;

    let attachment: ChatMessage['attachment'] | undefined;
    if (visionMode !== 'none') {
      const dataUrl = captureFrame();
      if (dataUrl) {
        attachment = {
          type: 'image',
          data: dataUrl.split(',')[1],
          mimeType: 'image/jpeg'
        };
        setPreviewFrame(dataUrl);
      }
    }

    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: Date.now(), attachment };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const modelName = isThinkingMode ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
      
      const parts: any[] = [{ text: input || "Analyze this visual input." }];
      if (attachment) {
        parts.push({ inlineData: { data: attachment.data, mimeType: attachment.mimeType } });
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: {
          systemInstruction: `You are ${identity.name}. Personality: ${identity.personality}. 
          CAPABILITIES:
          - VISION: You can see the user's screen or camera. Describe, analyze, or debug what is shown.
          - EXPORT: If asked for code, a document, or data, provide it clearly. Suggest downloading as .py, .html, .json, etc.
          - PARTNER: Act as a high-level strategist and friend.`,
          thinkingConfig: isThinkingMode ? { thinkingBudget: 32768 } : undefined,
          tools: isThinkingMode ? [{ googleSearch: {} }] : []
        },
      });

      const modelMsg: ChatMessage = { 
        role: 'model', 
        content: response.text || "Vision link unstable. Please retry.", 
        timestamp: Date.now() 
      };
      
      setMessages(prev => [...prev, modelMsg]);

      // Handle heuristic learning/tasks
      if (input.toLowerCase().startsWith('task:')) {
        addTask(input.replace(/task:/i, '').trim(), 'business', 'high');
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', content: "Neural bypass required. Core link lost.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
      setPreviewFrame(null);
    }
  };

  const exportContent = (content: string, ext: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura_export_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass rounded-[3rem] flex flex-col h-[750px] overflow-hidden border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative bg-black/40">
      {/* Background Decor */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Vision Stream Header */}
      {visionMode !== 'none' && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 animate-in slide-in-from-top-4 duration-500">
          <div className="relative p-1 bg-white/10 rounded-3xl backdrop-blur-3xl border border-white/10 shadow-2xl">
            <video ref={videoRef} className="w-64 h-36 rounded-2xl object-cover bg-black" muted />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">{visionMode} Peek Active</span>
            </div>
            <button 
              onClick={() => setVisionMode('none')}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white/50 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      <div className="p-8 border-b border-white/10 bg-white/[0.03] flex items-center justify-between backdrop-blur-2xl z-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-3xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30 group-hover:scale-105 transition-transform">
             <Icons.Brain className="w-8 h-8 text-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.5)]" />
          </div>
          <div>
            <h3 className="font-outfit font-black text-xl uppercase tracking-tight">{identity.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Vision-Enabled Core</span>
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Latency: 24ms</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => toggleVision('screen')}
            className={`p-3 rounded-xl transition-all border ${visionMode === 'screen' ? 'bg-indigo-500 border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-white/5 border-white/10 text-white/30 hover:text-white'}`}
            title="Screen Peek"
          >
            <Icons.Vision className="w-5 h-5" />
          </button>
          <button 
            onClick={() => toggleVision('camera')}
            className={`p-3 rounded-xl transition-all border ${visionMode === 'camera' ? 'bg-indigo-500 border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-white/5 border-white/10 text-white/30 hover:text-white'}`}
            title="Camera Link"
          >
            <Icons.Microphone className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide z-10 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-700`}>
            <div className={`max-w-[85%] px-8 py-6 rounded-[2.5rem] text-sm leading-relaxed shadow-2xl backdrop-blur-3xl relative group ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-tr-none font-bold' 
                : 'bg-white/[0.04] text-white/90 rounded-tl-none border border-white/10 font-medium'
            }`}>
              {msg.attachment && (
                <div className="mb-4 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                  <img src={`data:${msg.attachment.mimeType};base64,${msg.attachment.data}`} className="w-full h-auto max-h-48 object-cover" alt="Attached vision frame" />
                </div>
              )}
              <div className="whitespace-pre-wrap font-inter">
                {msg.content}
              </div>
              {msg.role === 'model' && (
                <div className="absolute -bottom-10 left-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => exportContent(msg.content, 'py')} className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-black text-white/40 hover:text-white uppercase tracking-tighter transition-all">Export .PY</button>
                  <button onClick={() => exportContent(msg.content, 'html')} className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-black text-white/40 hover:text-white uppercase tracking-tighter transition-all">Export .HTML</button>
                  <button onClick={() => exportContent(msg.content, 'json')} className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-black text-white/40 hover:text-white uppercase tracking-tighter transition-all">Export .JSON</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-4 items-center bg-white/[0.03] rounded-3xl px-7 py-4 border border-white/10">
              <div className="flex gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full animate-bounce ${isThinkingMode ? 'bg-purple-400' : 'bg-indigo-400'}`} />
                <div className={`w-2.5 h-2.5 rounded-full animate-bounce [animation-delay:0.2s] ${isThinkingMode ? 'bg-purple-400' : 'bg-indigo-400'}`} />
                <div className={`w-2.5 h-2.5 rounded-full animate-bounce [animation-delay:0.4s] ${isThinkingMode ? 'bg-purple-400' : 'bg-indigo-400'}`} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">
                Aura Scanning {visionMode !== 'none' ? 'Visuals' : 'Context'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-black/40 border-t border-white/10 backdrop-blur-3xl z-10">
        <div className="relative flex items-center gap-4">
          <button 
            onClick={() => setIsThinkingMode(!isThinkingMode)}
            className={`p-5 rounded-3xl transition-all duration-500 border ${
              isThinkingMode 
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.4)]' 
                : 'bg-white/5 border-white/10 text-white/20 hover:text-white/60 hover:bg-white/10'
            }`}
            title="Reasoning Mode"
          >
            <Icons.Brain className="w-7 h-7" />
          </button>
          
          <div className="relative flex-1 group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={visionMode !== 'none' ? `Describe the ${visionMode} to me...` : "Type a command or query..."}
              className={`w-full bg-white/[0.02] border rounded-[2rem] px-8 py-5 pr-20 focus:outline-none focus:ring-4 transition-all duration-700 placeholder:text-white/10 font-semibold text-base ${
                isThinkingMode 
                  ? 'border-purple-500/30 focus:ring-purple-500/10' 
                  : 'border-white/10 focus:ring-indigo-500/10'
              }`}
            />
            <button 
              onClick={handleSend}
              disabled={(!input.trim() && visionMode === 'none') || isLoading}
              className={`absolute right-3 top-3 p-3.5 rounded-2xl transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl ${
                isThinkingMode 
                  ? 'bg-purple-600 shadow-purple-500/30' 
                  : 'bg-indigo-500 shadow-indigo-500/30'
              }`}
            >
              <Icons.Send className="w-7 h-7 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSession;
