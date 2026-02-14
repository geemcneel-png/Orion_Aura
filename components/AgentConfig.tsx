
import React from 'react';
import { AgentIdentity } from '../types';
import { VOICES } from '../constants';

interface Props {
  identity: AgentIdentity;
  setIdentity: (identity: AgentIdentity) => void;
}

const AgentConfig: React.FC<Props> = ({ identity, setIdentity }) => {
  return (
    <div className="glass rounded-3xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold font-outfit mb-2">Agent Persona</h2>
          <p className="text-white/60">Customize how your home agent thinks, speaks, and behaves.</p>
        </div>

        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Agent Name</label>
            <input
              type="text"
              value={identity.name}
              onChange={(e) => setIdentity({ ...identity, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              placeholder="e.g. Aura, Nexus..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Voice Profile</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {VOICES.map((v) => (
                <button
                  key={v}
                  onClick={() => setIdentity({ ...identity, voice: v })}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    identity.voice === v
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Personality & Background</label>
            <textarea
              rows={5}
              value={identity.personality}
              onChange={(e) => setIdentity({ ...identity, personality: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
              placeholder="Describe your agent's personality traits and specialized knowledge..."
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
          <p className="text-xs text-indigo-300 leading-relaxed">
            Changes are saved locally to your device. This agent will use these traits when interacting with you through chat and voice sessions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentConfig;
