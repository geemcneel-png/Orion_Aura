
import React, { useState } from 'react';
import { WorkspaceService } from '../types';
import { Icons } from '../constants';

interface Props {
  fullScreen?: boolean;
  mini?: boolean;
}

const WorkspaceHub: React.FC<Props> = ({ fullScreen, mini }) => {
  const [githubPat, setGithubPat] = useState(() => localStorage.getItem('aura_github_pat') || '');
  const [services, setServices] = useState<WorkspaceService[]>([
    { id: 'google', name: 'Google Workspace', icon: 'G', connected: true },
    { id: 'notebooklm', name: 'Notebook LM', icon: 'NL', connected: true },
    { id: 'github', name: 'GitHub Enterprise', icon: 'GH', connected: githubPat.length > 0 },
    { id: 'slack', name: 'Slack Business', icon: 'S', connected: false },
  ]);

  const toggleConnection = (id: string) => {
    if (id === 'github' && !githubPat) return alert("Please enter a PAT first.");
    setServices(prev => prev.map(s => 
      s.id === id ? { ...s, connected: !s.connected, lastSync: !s.connected ? Date.now() : undefined } : s
    ));
  };

  const handlePatChange = (val: string) => {
    setGithubPat(val);
    localStorage.setItem('aura_github_pat', val);
  };

  if (mini) {
    return (
      <div className="glass rounded-[2rem] p-6 border border-white/10 space-y-5 bg-gradient-to-br from-white/[0.02] to-transparent">
        <div className="flex items-center justify-between">
          <h3 className="font-outfit font-black text-xs uppercase tracking-[0.2em] text-white/50">Core Sync</h3>
          <Icons.Workspace className="w-5 h-5 text-indigo-400/50" />
        </div>
        <div className="flex gap-4">
          {services.map(s => (
            <div 
              key={s.id} 
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black border transition-all relative ${
                s.connected ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400' : 'bg-white/5 border-white/5 text-white/10'
              }`}
            >
              {s.id === 'github' ? <Icons.GitHub className="w-6 h-6" /> : s.icon}
              {s.connected && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-black rounded-full animate-pulse" />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`glass rounded-[3rem] p-10 h-full flex flex-col border border-white/10 ${fullScreen ? 'animate-in fade-in slide-in-from-left-6 duration-700' : ''}`}>
      <div className="mb-12 flex justify-between items-start">
        <div>
          <h2 className="text-4xl font-black font-outfit uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Neural Integrations</h2>
          <p className="text-sm text-white/40 max-w-2xl leading-relaxed">
            Link your professional ecosystem. Aura uses these links to analyze docs, contribute to repositories, and optimize your schedule as your dedicated business partner.
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all">
          <Icons.User className="w-4 h-4" />
          Google Login
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Service Cards */}
        {services.map(service => (
          <div 
            key={service.id}
            className={`p-8 rounded-[2.5rem] border transition-all duration-700 flex flex-col gap-6 ${
              service.connected 
                ? 'bg-indigo-500/[0.03] border-indigo-500/30 shadow-2xl shadow-indigo-500/5' 
                : 'bg-white/[0.02] border-white/5 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl font-black ${
                  service.connected ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'bg-white/5 text-white/20'
                }`}>
                  {service.id === 'github' ? <Icons.GitHub className="w-8 h-8" /> : service.icon}
                </div>
                <div>
                  <h4 className="font-bold text-xl tracking-tight">{service.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${service.connected ? 'bg-green-500' : 'bg-white/10'}`} />
                    <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">{service.connected ? 'Active Sync' : 'Offline'}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => toggleConnection(service.id)}
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                  service.connected 
                    ? 'bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 border-white/10' 
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white border-transparent'
                }`}
              >
                {service.connected ? 'Revoke' : 'Link Hub'}
              </button>
            </div>

            {service.id === 'github' && (
              <div className="pt-4 border-t border-white/5 space-y-3">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Personal Access Token</label>
                <div className="relative">
                  <input 
                    type="password"
                    value={githubPat}
                    onChange={(e) => handlePatChange(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Icons.Code className="w-4 h-4 text-white/10" />
                  </div>
                </div>
              </div>
            )}
            
            {service.id === 'notebooklm' && service.connected && (
              <div className="pt-4 border-t border-white/5">
                 <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <Icons.Notebook className="w-5 h-5 text-indigo-400" />
                     <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Analysis Mode Active</span>
                   </div>
                   <span className="text-[10px] text-white/30 font-medium italic">8 documents indexed</span>
                 </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 p-10 rounded-[3rem] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-white/10 relative overflow-hidden group">
        <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-[2s]">
          <Icons.Brain className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h4 className="text-2xl font-black mb-4 font-outfit uppercase tracking-tight">Business Partnership Mode</h4>
          <p className="text-sm text-white/60 leading-relaxed mb-8">
            When partnership mode is active, I won't just follow orders—I will analyze your work habits, suggest revenue opportunities, and proactively remind you of strategic commitments.
          </p>
          <div className="flex gap-4">
            <button className="px-10 py-4 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all">
              Initialize Strategy
            </button>
            <button className="px-10 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
              Learn Patterns
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceHub;
