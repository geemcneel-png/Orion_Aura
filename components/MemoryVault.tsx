
import React from 'react';
import { MemoryEntry } from '../types';
import { Icons } from '../constants';

interface Props {
  memories: MemoryEntry[];
  fullScreen?: boolean;
}

const MemoryVault: React.FC<Props> = ({ memories, fullScreen }) => {
  return (
    <div className={`glass rounded-[3rem] p-10 h-full flex flex-col border border-white/10 ${fullScreen ? 'animate-in fade-in slide-in-from-right-6 duration-700' : ''}`}>
      <div className="flex items-center justify-between mb-12">
        <div>
          <h3 className="font-black font-outfit text-4xl uppercase tracking-tighter mb-2">Neural Vault</h3>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Strategic History & Learnings</p>
        </div>
        <div className="w-14 h-14 rounded-3xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-xl">
          <Icons.User className="w-7 h-7 text-indigo-400" />
        </div>
      </div>

      <div className="space-y-6 overflow-y-auto pr-4 scrollbar-hide flex-1">
        {memories.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
               <Icons.Notebook className="w-10 h-10 text-white/10" />
            </div>
            <p className="text-sm text-white/20 italic max-w-[220px] leading-relaxed font-bold uppercase tracking-widest">Awaiting significant events to index.</p>
          </div>
        ) : (
          memories.map((memory) => (
            <div key={memory.id} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group cursor-default relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform">
                {memory.category === 'motivation' && <Icons.Motivation className="w-16 h-16" />}
                {memory.category === 'learning' && <Icons.Notebook className="w-16 h-16" />}
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] px-4 py-1.5 rounded-xl uppercase font-black tracking-[0.2em] shadow-sm ${
                  memory.category === 'note' ? 'bg-purple-500/20 text-purple-300' : 
                  memory.category === 'code_snippet' ? 'bg-pink-500/20 text-pink-300' :
                  memory.category === 'learning' ? 'bg-blue-500/20 text-blue-300' :
                  memory.category === 'motivation' ? 'bg-orange-500/20 text-orange-300' :
                  'bg-indigo-500/20 text-indigo-300'
                }`}>
                  {memory.category.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">{new Date(memory.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <p className={`text-base text-white/80 leading-relaxed ${memory.category === 'code_snippet' ? 'font-mono text-[12px] bg-black/40 p-5 rounded-2xl border border-white/5' : 'font-semibold'}`}>
                {memory.content}
              </p>
            </div>
          ))
        )}
      </div>

      {fullScreen && memories.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-4">
           <button className="py-5 rounded-3xl bg-white/5 hover:bg-white/10 text-[11px] font-black uppercase tracking-[0.3em] transition-all border border-white/10 shadow-lg">
             Neural Dump
           </button>
           <button className="py-5 rounded-3xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-black uppercase tracking-[0.3em] transition-all border border-red-500/20 shadow-lg">
             Purge Core
           </button>
        </div>
      )}
    </div>
  );
};

export default MemoryVault;
