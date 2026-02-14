
import React, { useState, useEffect } from 'react';
import { NetworkDevice } from '../types';

interface Props {
  fullScreen?: boolean;
}

const DeviceHub: React.FC<Props> = ({ fullScreen }) => {
  const [devices, setDevices] = useState<NetworkDevice[]>([
    { 
      id: '1', name: 'Master MacBook Pro', type: 'laptop', status: 'online', connection: 'wifi',
      state: { power: true }
    },
    { 
      id: '2', name: 'Living Room TV', type: 'iot', status: 'online', connection: 'wifi',
      state: { power: true, level: 65, label: 'Brightness' }
    },
    { 
      id: '3', name: 'iPhone 15 Pro', type: 'smartphone', status: 'online', connection: 'wifi' 
    },
    { 
      id: '4', name: 'Sony XM5', type: 'speaker', status: 'offline', connection: 'bluetooth',
      state: { power: false, level: 40, label: 'Volume' }
    },
  ]);
  const [isScanning, setIsScanning] = useState(false);
  const [executingId, setExecutingId] = useState<string | null>(null);

  const startScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      if (!devices.find(d => d.id === '5')) {
        setDevices(prev => [...prev, { 
          id: '5', name: 'Smart Bulb 02', type: 'iot', status: 'online', connection: 'bluetooth',
          state: { power: false, level: 80, label: 'Brightness' }
        }]);
      }
    }, 2500);
  };

  const updateDeviceState = (id: string, newState: Partial<NonNullable<NetworkDevice['state']>>) => {
    setExecutingId(id);
    
    // Simulate API delay
    setTimeout(() => {
      setDevices(prev => prev.map(d => 
        d.id === id ? { ...d, state: { ...d.state, ...newState } } : d
      ));
      setExecutingId(null);
    }, 400);
  };

  return (
    <div className={`glass rounded-3xl p-6 h-full flex flex-col ${fullScreen ? 'animate-in fade-in zoom-in-95 duration-500' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold font-outfit text-lg tracking-tight">Home Network</h3>
          <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">WiFi: Aura_Home_5G</p>
        </div>
        <button 
          onClick={startScan}
          disabled={isScanning}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            isScanning ? 'bg-indigo-500/20 text-indigo-400 cursor-wait' : 'bg-white/5 hover:bg-white/10 text-white border border-white/5'
          }`}
        >
          {isScanning ? 'Scanning...' : 'Scan Devices'}
        </button>
      </div>

      <div className="space-y-4 overflow-y-auto pr-1 flex-1 scrollbar-hide">
        {devices.map((device) => (
          <div 
            key={device.id} 
            className={`p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-4 group transition-all duration-300 ${
              device.status === 'offline' ? 'opacity-60 grayscale-[0.5]' : 'hover:bg-white/[0.07]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl transition-all duration-500 ${
                  device.state?.power 
                    ? 'bg-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                    : 'bg-white/5 text-white/30'
                }`}>
                  {device.type === 'laptop' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                  {device.type === 'smartphone' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
                  {device.type === 'iot' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                  {device.type === 'speaker' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>}
                </div>
                <div>
                  <h4 className="text-sm font-semibold tracking-wide">{device.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${device.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-white/20'}`} />
                    <span className="text-[9px] uppercase tracking-wider text-white/40 font-bold">{device.connection}</span>
                  </div>
                </div>
              </div>

              {device.state && device.status === 'online' && (
                <button 
                  onClick={() => updateDeviceState(device.id, { power: !device.state?.power })}
                  disabled={executingId === device.id}
                  className={`relative w-11 h-6 rounded-full transition-all duration-300 flex items-center p-1 ${
                    device.state?.power ? 'bg-indigo-500' : 'bg-white/10'
                  } ${executingId === device.id ? 'opacity-50 cursor-wait' : ''}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 transform ${
                    device.state?.power ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              )}
            </div>

            {device.status === 'online' && device.state?.power && device.state.level !== undefined && (
              <div className="px-1 space-y-2 animate-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center text-[10px] text-white/50 font-bold uppercase tracking-widest">
                  <span>{device.state.label}</span>
                  <span>{device.state.level}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={device.state.level}
                  onChange={(e) => updateDeviceState(device.id, { level: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            )}
            
            {executingId === device.id && (
              <div className="absolute inset-0 bg-indigo-500/5 backdrop-blur-[1px] rounded-2xl flex items-center justify-center animate-pulse pointer-events-none">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Applying...</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {isScanning && (
        <div className="mt-4 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center gap-3 animate-pulse">
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 w-1/3 animate-[progress_1.5s_infinite_linear]" />
          </div>
          <span className="text-[10px] text-indigo-400 font-bold tracking-[0.2em] uppercase">Scanning Spectrum...</span>
        </div>
      )}

      <style>{`
        @keyframes progress {
          from { transform: translateX(-100%); }
          to { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default DeviceHub;
