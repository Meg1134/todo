import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Layout, History, CheckCircle2, Rocket } from 'lucide-react';
import { Task } from './types';
import TaskCard from './components/TaskCard';
import CreateTaskModal from './components/CreateTaskModal';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('nexus-tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load tasks", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('nexus-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>) => {
    const task: Task = {
      ...newTask,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      isCompleted: false,
    };
    setTasks(prev => [task, ...prev]);
  };

  const toggleComplete = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          isCompleted: !t.isCompleted,
          completedAt: !t.isCompleted ? new Date().toISOString() : undefined
        };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Sort tasks
  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by completion first
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
    // Then by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const activeTasks = sortedTasks.filter(t => !t.isCompleted);
  const historyTasks = sortedTasks.filter(t => t.isCompleted);
  const displayTasks = activeTab === 'active' ? activeTasks : historyTasks;

  const pendingCount = activeTasks.length;

  return (
    <div className="min-h-screen relative overflow-hidden text-zinc-100 selection:bg-blue-500/30">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-900/20 rounded-full blur-3xl animate-blob filter opacity-50"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-900/20 rounded-full blur-3xl animate-blob animation-delay-2000 filter opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl animate-blob animation-delay-4000 filter opacity-50"></div>
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/5">
                 <Rocket className="w-6 h-6 text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 tracking-tight">Nexus Tasks</h1>
            </div>
            <p className="text-zinc-500 font-medium">
              您有 <span className="text-white">{pendingCount}</span> 个待办任务。开始行动吧。
            </p>
          </div>

          <div className="flex items-center gap-4 bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-800 backdrop-blur-sm shadow-xl">
             <button
               onClick={() => setActiveTab('active')}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                 activeTab === 'active' 
                 ? 'bg-zinc-800 text-white shadow-sm' 
                 : 'text-zinc-500 hover:text-zinc-300'
               }`}
             >
               <Layout className="w-4 h-4" />
               当前
             </button>
             <button
               onClick={() => setActiveTab('history')}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                 activeTab === 'history' 
                 ? 'bg-zinc-800 text-white shadow-sm' 
                 : 'text-zinc-500 hover:text-zinc-300'
               }`}
             >
               <History className="w-4 h-4" />
               历史
             </button>
          </div>
        </header>

        {/* Action Bar */}
        <div className="flex justify-end mb-8 sticky top-4 z-30">
           <button
             onClick={() => setIsModalOpen(true)}
             className="group flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:scale-105 transition-all duration-300"
           >
             <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
             <span>新建任务</span>
           </button>
        </div>

        {/* Task Grid */}
        <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pb-20"
        >
          <AnimatePresence mode="popLayout">
            {displayTasks.length > 0 ? (
              displayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={toggleComplete}
                  onDelete={deleteTask}
                />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-600"
              >
                {activeTab === 'active' ? (
                   <>
                    <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500/50" />
                    </div>
                    <p className="text-lg font-medium text-zinc-500">全部完成！享受美好的一天。</p>
                   </>
                ) : (
                   <p>暂无历史记录。</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <CreateTaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={addTask}
        />
      </div>
    </div>
  );
};

export default App;