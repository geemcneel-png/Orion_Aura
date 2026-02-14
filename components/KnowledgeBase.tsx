
import React from 'react';
import { LocalFolder } from '../types';
import { Icons } from '../constants';

interface Props {
  folders: LocalFolder[];
  setFolders: React.Dispatch<React.SetStateAction<LocalFolder[]>>;
  fullScreen?: boolean;
  mini?: boolean;
}

const KnowledgeBase: React.FC<Props> = ({ folders, setFolders, fullScreen, mini }) => {
  const addFolder = async () => {
    try {
      const handle = await (window as any).showDirectoryPicker();
      const newFolder: LocalFolder = {
        name: handle.name,
        handle,
        indexedAt: Date.now()
      };
      setFolders(prev => [...prev, newFolder]);
    } catch (err) {
      console.error('Directory picker error:', err);
    }
  };

  if (mini) {
    return (
      <div className="glass rounded-[2rem] p-6 border border-white/10 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-outfit font-black text-xs uppercase tracking-[0.2em] text-white/50">Local Vault</h3>
          <Icons.Folder className="w-5 h-5 text-purple-400/50" />
        </div>
        <div className="space-y-3">
          {folders.length === 0 ? (
            <button 
              onClick={addFolder}
              className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/30 hover:bg-white/5 transition-all"
            >
              + Index Local Folder
            </button>
          ) : (
            folders.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <Icons.Folder className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold truncate text-white/80">{f.name}</span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`glass rounded-[3rem] p-10 h-full flex flex-col border border-white/10 ${fullScreen ? 'animate-in fade-in slide-in-from-left-6 duration-700' : ''}`}>
      <div className="flex justify-between items-start mb-12">
        <div>
          <h2 className="text-4xl font-black font-outfit uppercase tracking-tighter mb-4">Offline Knowledge</h2>
          <p className="text-sm text-white/40 max-w-2xl leading-relaxed">
            Aura can read local directories on your laptop to build an offline context base. Indexed files never leave your device and are used only for RAG analysis during sessions.
          </p>
        </div>
        <button 
          onClick={addFolder}
          className="px-10 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-500/20"
        >
          Add Directory
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2 scrollbar-hide">
        {folders.map((folder, idx) => (
          <div key={idx} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex flex-col gap-6 group hover:bg-white/[0.04] transition-all">
            <div className="w-16 h-16 rounded-3xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Icons.Folder className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h4 className="font-bold text-xl mb-1">{folder.name}</h4>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                Indexed: {new Date(folder.indexedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
               <button className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-indigo-500/20 text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all">Sync</button>
               <button className="px-4 py-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-red-400 border border-white/5">
                 <Icons.Settings className="w-4 h-4" />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBase;
