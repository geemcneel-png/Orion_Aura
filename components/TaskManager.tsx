
import React, { useState } from 'react';
import { Task } from '../types';
import { Icons } from '../constants';

interface Props {
  tasks: Task[];
  setTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
  fullScreen?: boolean;
  mini?: boolean;
}

const TaskManager: React.FC<Props> = ({ tasks, setTasks, fullScreen, mini }) => {
  const [filter, setFilter] = useState<Task['category'] | 'all'>('all');

  const toggleTask = (id: string) => {
    if (!setTasks) return;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.category === filter);

  if (mini) {
    return (
      <div className="glass rounded-[2rem] p-6 border border-white/10 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-outfit font-black text-xs uppercase tracking-[0.2em] text-white/50">Priorities</h3>
          <Icons.Task className="w-5 h-5 text-green-400/50" />
        </div>
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-[10px] text-white/20 italic text-center py-2">No active tasks.</p>
          ) : (
            tasks.map(t => (
              <div key={t.id} className="flex items-center gap-3 group">
                <div className={`w-1.5 h-1.5 rounded-full ${t.completed ? 'bg-white/10' : 'bg-green-500 animate-pulse'}`} />
                <span className={`text-xs truncate transition-all ${t.completed ? 'text-white/20 line-through' : 'text-white/70 font-medium'}`}>
                  {t.title}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`glass rounded-[3rem] p-10 h-full flex flex-col border border-white/10 ${fullScreen ? 'animate-in fade-in slide-in-from-right-6 duration-700' : ''}`}>
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-4xl font-black font-outfit uppercase tracking-tighter mb-2">Growth Matrix</h2>
          <p className="text-sm text-white/40 uppercase tracking-widest font-bold">Actionable Strategic Goals</p>
        </div>
        <div className="flex gap-2">
          {['all', 'business', 'personal', 'coding'].map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat as any)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                filter === cat ? 'bg-white text-black border-white' : 'bg-white/5 text-white/30 border-white/5 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 space-y-4 scrollbar-hide">
        {filteredTasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
            <Icons.Task className="w-20 h-20 mb-4" />
            <p className="text-xl font-bold italic">Command clear. Matrix empty.</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div 
              key={task.id} 
              onClick={() => toggleTask(task.id)}
              className={`p-8 rounded-[2rem] border transition-all duration-500 cursor-pointer flex items-center justify-between group ${
                task.completed ? 'bg-white/[0.01] border-white/5' : 'bg-white/[0.03] border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/[0.02]'
              }`}
            >
              <div className="flex items-center gap-6">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  task.completed ? 'bg-indigo-500 border-indigo-500' : 'border-white/20 group-hover:border-indigo-400'
                }`}>
                  {task.completed && <Icons.Task className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h4 className={`text-lg font-bold transition-all ${task.completed ? 'text-white/20 line-through' : 'text-white'}`}>
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">{task.category}</span>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      task.priority === 'high' ? 'text-red-400' : task.priority === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                    }`}>
                      {task.priority} Priority
                    </span>
                  </div>
                </div>
              </div>
              
              {!task.completed && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Execute Task</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <Icons.Send className="w-4 h-4 text-indigo-400" />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Efficiency</p>
          <p className="text-2xl font-black font-outfit">84%</p>
        </div>
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Deep Work</p>
          <p className="text-2xl font-black font-outfit text-indigo-400">4.2h</p>
        </div>
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Goals Hit</p>
          <p className="text-2xl font-black font-outfit text-green-400">{tasks.filter(t => t.completed).length}</p>
        </div>
      </div>
    </div>
  );
};

export default TaskManager;
