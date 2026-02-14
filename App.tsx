
import React, { useState, useEffect, useCallback } from 'react';
import { AgentIdentity, MemoryEntry, NetworkDevice, ChatMessage, Task, LocalFolder } from './types';
import { DEFAULT_IDENTITY, Icons } from './constants';
import AgentConfig from './components/AgentConfig';
import DeviceHub from './components/DeviceHub';
import ChatSession from './components/ChatSession';
import LiveVoice from './components/LiveVoice';
import MemoryVault from './components/MemoryVault';
import WorkspaceHub from './components/WorkspaceHub';
import TaskManager from './components/TaskManager';
import KnowledgeBase from './components/KnowledgeBase';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'tasks' | 'knowledge' | 'workspace' | 'settings'>('home');
  const [identity, setIdentity] = useState<AgentIdentity>(() => {
    const saved = localStorage.getItem('aura_identity');
    return saved ? JSON.parse(saved) : DEFAULT_IDENTITY;
  });
  const [memories, setMemories] = useState<MemoryEntry[]>(() => {
    const saved = localStorage.getItem('aura_memories');
    return saved ? JSON.parse(saved) : [];
  });
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('aura_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [folders, setFolders] = useState<LocalFolder[]>([]);
  const [isLiveActive, setIsLiveActive] = useState(false);

  useEffect(() => {
    localStorage.setItem('aura_identity', JSON.stringify(identity));
  }, [identity]);

  useEffect(() => {
    localStorage.setItem('aura_memories', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem('aura_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addMemory = useCallback((content: string, category: MemoryEntry['category'] = 'fact') => {
    const newMemory: MemoryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      content,
      timestamp: Date.now(),
      category
    };
    setMemories(prev => [newMemory, ...prev].slice(0, 100));
  }, []);

  const addTask = useCallback((title: string, category: Task['category'] = 'business', priority: Task['priority'] = 'medium') => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      completed: false,
      priority,
      category,
      dueDate: Date.now() + 86400000 
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  return (
    <div className="min-h-screen flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 z-20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-2xl shadow-indigo-500/30 hover:rotate-3 transition-transform cursor-pointer">
            <Icons.Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black font-outfit tracking-tighter uppercase leading-none">Aura Intelligence</h1>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">Neural Integrated Assistant</span>
               <div className="w-1 h-1 rounded-full bg-indigo-500/50" />
               <span className="text-[10px] text-indigo-400 uppercase tracking-[0.2em] font-bold">V 3.0 Vision Active</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
            onClick={() => setIsLiveActive(true)}
            className="group flex items-center gap-4 px-8 py-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-sm font-bold border border-white/10"
          >
            <div className="flex gap-1 items-end h-3">
              {[0,1,2].map(i => <div key={i} className="w-1 bg-indigo-500 rounded-full h-full animate-bounce" style={{animationDelay: `${i*0.2}s`}} />)}
            </div>
            <span className="text-white/70 group-hover:text-white uppercase tracking-widest text-[11px]">Sync Voice</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col min-h-0 z-10">
        {activeTab === 'home' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <ChatSession identity={identity} addMemory={addMemory} addTask={addTask} />
            </div>
            <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-1 custom-scrollbar">
              <TaskManager tasks={tasks.slice(0, 3)} mini />
              <KnowledgeBase folders={folders} setFolders={setFolders} mini />
              <DeviceHub />
              <MemoryVault memories={memories.slice(0, 3)} />
            </div>
          </div>
        )}

        {activeTab === 'tasks' && <TaskManager tasks={tasks} setTasks={setTasks} fullScreen />}
        {activeTab === 'knowledge' && <KnowledgeBase folders={folders} setFolders={setFolders} fullScreen />}
        {activeTab === 'workspace' && <WorkspaceHub fullScreen />}
        {activeTab === 'settings' && <AgentConfig identity={identity} setIdentity={setIdentity} />}
      </main>

      {/* Navigation Dock */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 glass rounded-[2.5rem] p-2.5 flex items-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 border border-white/10 backdrop-blur-3xl">
        {[
          { id: 'home', icon: Icons.Home, label: 'Dash' },
          { id: 'tasks', icon: Icons.Task, label: 'Matrix' },
          { id: 'knowledge', icon: Icons.Folder, label: 'Vault' },
          { id: 'workspace', icon: Icons.Workspace, label: 'Cloud' },
          { id: 'settings', icon: Icons.Settings, label: 'Core' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-6 py-4 rounded-[1.8rem] transition-all duration-500 group ${
              activeTab === tab.id 
                ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-2xl scale-105' 
                : 'text-white/30 hover:text-white/60 hover:bg-white/5'
            }`}
          >
            <tab.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-white' : ''}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'block' : 'hidden xl:block'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Live Voice Overlay */}
      {isLiveActive && (
        <LiveVoice 
          identity={identity} 
          onClose={() => setIsLiveActive(false)} 
          onMemoryCapture={(content) => addMemory(content, 'fact')}
        />
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
};

export default App;
