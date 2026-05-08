/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Moon, 
  Sun, 
  Calendar,
  Clock,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Filter,
  Edit2,
  Check,
  X,
  AlertCircle,
  Activity,
} from 'lucide-react';
import Quote from './components/Quote';
import { Task, getStoredTasks, saveTasks, Priority } from './lib/storage';

type SortKey = 'priority' | 'createdAt' | 'dueDate';
type SortOrder = 'asc' | 'desc';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('medium');
  const [dueDateInput, setDueDateInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [timeLeft, setTimeLeft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTasks(getStoredTasks());

    const timer = setInterval(() => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const addTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false,
      createdAt: Date.now(),
      priority: selectedPriority,
      dueDate: dueDateInput ? new Date(dueDateInput).getTime() : undefined,
    };

    setTasks([newTask, ...tasks]);
    setInputValue('');
    setSelectedPriority('medium');
    setDueDateInput('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const clearCompleted = () => {
    setTasks(tasks.filter(t => !t.completed));
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditValue(task.text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEdit = (id: string) => {
    if (!editValue.trim()) {
      cancelEditing();
      return;
    }
    setTasks(tasks.map(t => t.id === id ? { ...t, text: editValue.trim() } : t));
    cancelEditing();
  };

  const priorityMap: Record<Priority, number> = {
    low: 1,
    medium: 2,
    high: 3,
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    // Rule 1: High priority tasks always come first
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (a.priority !== 'high' && b.priority === 'high') return 1;

    // Rule 2: Medium before low
    if (a.priority === 'medium' && b.priority === 'low') return -1;
    if (a.priority === 'low' && b.priority === 'medium') return 1;

    // Rule 3: Within same priority, use selected sort
    let comparison = 0;
    if (sortKey === 'priority') {
      comparison = priorityMap[a.priority] - priorityMap[b.priority];
    } else if (sortKey === 'createdAt') {
      comparison = a.createdAt - b.createdAt;
    } else if (sortKey === 'dueDate') {
      const aVal = a.dueDate || 0;
      const bVal = b.dueDate || 0;
      comparison = aVal - bVal;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-brand-bg text-zinc-900 dark:text-brand-text font-sans selection:bg-brand-accent selection:text-black relative overflow-x-hidden">
      {/* Background Decorative Text */}
      <div className="absolute -top-10 -right-20 text-[24rem] font-black text-zinc-900/[0.03] dark:text-white/[0.03] leading-none pointer-events-none uppercase select-none">
        Today
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        {/* Top Header Navigation */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 dark:text-white/40 mb-2">The Daily Purge</span>
            <div className="flex items-center gap-4">
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-none">PLANNER</h1>
              <button 
                onClick={() => setIsDark(!isDark)}
                className="p-3 rounded-2xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                id="theme-toggle"
                title="Toggle Theme"
              >
                {isDark ? <Sun className="w-6 h-6 text-brand-accent" /> : <Moon className="w-6 h-6 text-zinc-400" />}
              </button>
            </div>
          </div>
          <div className="text-left md:text-right">
            <div className="text-5xl md:text-6xl font-mono font-light tracking-tight text-zinc-900 dark:text-brand-accent tabular-nums">
              {timeLeft || '00:00:00'}
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 dark:text-white/40 mt-1">until data expiration</div>
          </div>
        </header>

        {/* Global Sort Controls */}
        <div className="flex flex-wrap items-center gap-6 mb-12 border-b border-zinc-100 dark:border-white/10 pb-8">
          <div className="flex items-center gap-2 text-zinc-400 dark:text-white/40">
            <Filter className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Sort By</span>
          </div>
          <div className="flex gap-4">
            {(['createdAt', 'priority', 'dueDate'] as SortKey[]).map((key) => (
              <button
                key={key}
                onClick={() => toggleSort(key)}
                className={`group flex items-center gap-2 text-xs uppercase tracking-widest font-bold transition-all ${
                  sortKey === key 
                    ? 'text-zinc-900 dark:text-brand-accent' 
                    : 'text-zinc-400 dark:text-white/20 hover:text-zinc-600 dark:hover:text-white/40'
                }`}
              >
                <span>{key === 'createdAt' ? 'Time' : key === 'dueDate' ? 'Due' : key}</span>
                {sortKey === key ? (
                  sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                ) : (
                  <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                )}
              </button>
            ))}
          </div>
        </div>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Task List Area */}
          <section className="lg:col-span-7 flex flex-col order-2 lg:order-1">
            <div className="space-y-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {tasks.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-12 px-6 theme-card border-dashed"
                  >
                    <p className="text-zinc-400 dark:text-white/20 text-2xl font-light">Your slate is clean. Define your day.</p>
                  </motion.div>
                ) : (
                  sortedTasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ 
                          opacity: task.completed ? 0.5 : 1,
                          x: 0,
                          scale: task.completed ? [1, 1.02, 1] : 1,
                        }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group flex items-center border-b border-zinc-100 dark:border-white/10 pb-6 relative overflow-hidden pl-4"
                        id={`task-${task.id}`}
                      >
                        {/* Priority Accent Line */}
                        <div className={`absolute left-0 top-2 bottom-6 w-1 rounded-full transition-colors duration-500 z-10 ${
                          task.priority === 'high' ? 'bg-red-500' :
                          task.priority === 'medium' ? 'bg-zinc-400 dark:bg-zinc-600' :
                          'bg-zinc-200 dark:bg-zinc-800'
                        }`} />
                      {/* Flash Overlay */}
                      {task.completed && (
                        <motion.div
                          initial={{ opacity: 1 }}
                          animate={{ opacity: 0 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="absolute inset-0 bg-brand-accent/20 pointer-events-none z-0"
                        />
                      )}
                      <span className="text-2xl md:text-3xl font-mono font-light text-zinc-300 dark:text-white/20 mr-8 tabular-nums relative z-10">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-4 relative z-10">
                        {editingId === task.id ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              autoFocus
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit(task.id);
                                if (e.key === 'Escape') cancelEditing();
                              }}
                              className="flex-1 bg-white dark:bg-brand-bg border-b-2 border-brand-accent outline-none text-2xl md:text-3xl font-medium tracking-tight text-zinc-900 dark:text-brand-text py-1"
                            />
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => saveEdit(task.id)}
                                className="p-2 text-brand-accent hover:scale-110 transition-transform"
                                title="Save"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                                title="Cancel"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <button
                              onClick={() => toggleTask(task.id)}
                              className={`text-2xl md:text-3xl font-medium tracking-tight text-left transition-all duration-500 ${
                                task.completed ? 'line-through decoration-1 text-zinc-400' : 'text-zinc-800 dark:text-brand-text'
                              }`}
                            >
                              {task.text}
                            </button>
                            <div className="flex items-center gap-2">
                              <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-sm w-fit transition-colors duration-500 ${
                                task.priority === 'high' 
                                  ? 'bg-red-500/10 text-red-500 ring-1 ring-red-500/20' :
                                task.priority === 'medium' 
                                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400' :
                                  'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600'
                              }`}>
                                {task.priority === 'high' && <AlertCircle className="w-3 h-3" />}
                                {task.priority === 'medium' && <Activity className="w-3 h-3" />}
                                {task.priority === 'low' && <ArrowDown className="w-3 h-3" />}
                                {task.priority}
                              </div>
                              {task.dueDate && (
                                <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-zinc-400 dark:text-white/30 font-bold bg-zinc-50 dark:bg-white/5 px-2 py-0.5 rounded-sm transition-colors duration-500">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        {!editingId && (
                          <button
                            onClick={() => startEditing(task)}
                            className="p-2 text-zinc-300 hover:text-brand-accent opacity-0 group-hover:opacity-100 transition-all"
                            title="Edit task"
                          >
                            <Edit2 className="w-5 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-2 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-5 h-4" />
                        </button>
                        <motion.div 
                          onClick={() => toggleTask(task.id)}
                          whileTap={{ scale: 0.8 }}
                          animate={{ 
                            scale: task.completed ? [1, 1.2, 1] : 1,
                          }}
                          className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                            task.completed 
                              ? 'bg-brand-accent border-brand-accent shadow-[0_0_15px_rgba(212,255,63,0.5)]' 
                              : 'border-zinc-200 dark:border-white/20 group-hover:border-brand-accent'
                          }`}
                        >
                          {task.completed && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <CheckCircle2 className="w-5 h-5 text-black p-0.5" />
                            </motion.div>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="mt-12 group space-y-4">
              <div className="flex flex-wrap items-center gap-8">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 dark:text-white/40">Priority</span>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setSelectedPriority(p)}
                        className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-xl border transition-all font-bold ${
                          selectedPriority === p
                            ? 'bg-zinc-900 dark:bg-brand-accent text-white dark:text-black border-transparent shadow-lg'
                            : 'bg-transparent border-zinc-200 dark:border-white/10 text-zinc-400 dark:text-white/30 hover:border-zinc-300 dark:hover:border-white/20'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 dark:text-white/40">Due Time</span>
                  <input 
                    type="time" 
                    value={dueDateInput}
                    onChange={(e) => setDueDateInput(e.target.value)}
                    className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-white/60 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  />
                </div>
              </div>
              <form onSubmit={addTask} className="flex items-center bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-3xl p-4 md:p-6 transition-all focus-within:ring-2 focus-within:ring-brand-accent focus-within:border-transparent">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Focus on one task..."
                  className="bg-transparent border-none outline-none text-xl md:text-2xl w-full placeholder:text-zinc-400 dark:placeholder:text-white/20 px-2"
                />
                <button 
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="bg-zinc-900 dark:bg-brand-accent text-white dark:text-black px-6 md:px-8 py-3 rounded-2xl font-bold uppercase text-sm tracking-tighter hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  Add Task
                </button>
              </form>
            </div>
          </section>

          {/* Sidebar Content */}
          <aside className="lg:col-span-5 flex flex-col gap-12 order-1 lg:order-2">
            <Quote />

            {/* Stats / Mood Section */}
            <div className="space-y-6">
              <h3 className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 dark:text-white/40">Efficiency Metrics</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 theme-card p-8 accent-glow">
                  <div className="text-4xl md:text-5xl font-bold mb-1">{tasks.length}</div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-white/30">Total Objectives</div>
                </div>
                <div className="flex-1 bg-zinc-900 dark:bg-brand-accent theme-card p-8 border-transparent transition-all">
                  <div className="text-4xl md:text-5xl font-bold text-white dark:text-black mb-1">
                    {Math.round(progress)}%
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-black/60 font-bold">Execution</div>
                </div>
              </div>

              {/* Progress Line */}
              <div className="space-y-4">
                <div className="relative h-2 w-full bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="absolute top-0 left-0 h-full bg-zinc-900 dark:bg-brand-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                
                {completedCount > 0 && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={clearCompleted}
                    className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 hover:text-red-500 dark:text-white/20 dark:hover:text-red-400 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    Purge Completed Data
                  </motion.button>
                )}
              </div>
            </div>

            <div className="hidden lg:block pt-12 border-t border-zinc-100 dark:border-white/5">
               <p className="text-[10px] uppercase tracking-widest text-zinc-300 dark:text-white/20 leading-relaxed font-medium">
                DayBreak operates on a non-retention core principle. All local data is purged at 00:00:00 every 24 hours. No clouds, no servers, just today.
               </p>
            </div>
          </aside>
        </main>

        {/* Footer */}
        <footer className="mt-20 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-zinc-400 dark:text-white/20">
          <div>Session Status: Operational</div>
          <div className="flex gap-8">
            <span>Clean Slate: {new Date(new Date().setHours(24,0,0,0)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            <span className="text-zinc-600 dark:text-brand-accent">{isDark ? 'Dark Mode Active' : 'Light Mode Active'}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

