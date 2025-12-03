import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Plus, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Task, Priority, LinkResource } from '../types';
import { enhanceTaskContent } from '../services/geminiService';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (task: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>) => void;
}

const PRIORITY_OPTIONS = [
    { value: Priority.LOW, label: '低' },
    { value: Priority.MEDIUM, label: '中' },
    { value: Priority.HIGH, label: '高' },
    { value: Priority.CRITICAL, label: '紧急' },
];

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('12:00');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [links, setLinks] = useState<LinkResource[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  const handleEnhance = async () => {
    if (!title) return;
    setIsEnhancing(true);
    const result = await enhanceTaskContent(title, description);
    if (result) {
      setDescription(result.improvedDescription);
      setPriority(result.suggestedPriority);
      setTags(result.suggestedTags);
    }
    setIsEnhancing(false);
  };

  const handleAddLink = () => {
    if (newLinkTitle && newLinkUrl) {
      setLinks([...links, { id: crypto.randomUUID(), title: newLinkTitle, url: newLinkUrl }]);
      setNewLinkTitle('');
      setNewLinkUrl('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return;

    const finalDate = new Date(`${dueDate}T${dueTime}`);

    onCreate({
      title,
      description,
      dueDate: finalDate.toISOString(),
      priority,
      resources: links,
      tags
    });
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setDueTime('12:00');
    setPriority(Priority.MEDIUM);
    setLinks([]);
    setTags([]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-zinc-900 border border-zinc-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl pointer-events-auto flex flex-col">
              
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-zinc-900/50 sticky top-0 backdrop-blur-md z-10">
                <h2 className="text-xl font-semibold text-white">新建任务</h2>
                <button onClick={onClose} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                
                {/* Title Input & AI Button */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">任务标题</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="例如：准备第四季度营销报告"
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleEnhance}
                      disabled={!title || isEnhancing}
                      className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-900/20 whitespace-nowrap"
                    >
                      {isEnhancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span className="hidden sm:inline">智能润色</span>
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">描述</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="添加详细说明..."
                    className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                  />
                  {tags.length > 0 && (
                     <div className="flex gap-2 flex-wrap">
                        {tags.map(tag => (
                            <span key={tag} className="text-xs text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">#{tag}</span>
                        ))}
                     </div>
                  )}
                </div>

                {/* Grid for Date, Time, Priority */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">截止日期</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">时间</label>
                    <input
                      type="time"
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">优先级</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as Priority)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                    >
                      {PRIORITY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Links Section */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-zinc-400">资源链接 & 资料</label>
                    <div className="flex gap-2">
                        <input 
                            placeholder="标题 (例如: 设计规范)" 
                            value={newLinkTitle}
                            onChange={(e) => setNewLinkTitle(e.target.value)}
                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white"
                        />
                        <input 
                            placeholder="URL" 
                            value={newLinkUrl}
                            onChange={(e) => setNewLinkUrl(e.target.value)}
                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white"
                        />
                        <button 
                            type="button" 
                            onClick={handleAddLink}
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    {links.length > 0 && (
                        <ul className="space-y-1">
                            {links.map((link) => (
                                <li key={link.id} className="flex items-center justify-between text-sm bg-zinc-900/50 px-3 py-2 rounded border border-zinc-800/50">
                                    <div className="flex items-center gap-2">
                                        <LinkIcon className="w-3 h-3 text-zinc-500" />
                                        <span className="text-zinc-300">{link.title}</span>
                                        <span className="text-zinc-600 text-xs truncate max-w-[150px]">{link.url}</span>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setLinks(links.filter(l => l.id !== link.id))}
                                        className="text-zinc-500 hover:text-red-400"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

              </div>

              {/* Footer */}
              <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 sticky bottom-0 backdrop-blur-md flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 text-zinc-400 hover:text-white font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!title || !dueDate}
                  className="px-6 py-2.5 bg-white text-black hover:bg-zinc-200 font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  创建任务
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateTaskModal;