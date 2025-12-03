import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Link as LinkIcon, Trash2, Calendar } from 'lucide-react';
import { Task, Priority } from '../types';
import Countdown from './Countdown';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_MAP: Record<Priority, string> = {
  [Priority.LOW]: '低',
  [Priority.MEDIUM]: '中',
  [Priority.HIGH]: '高',
  [Priority.CRITICAL]: '紧急'
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleComplete, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine urgency color
  const now = new Date();
  const due = new Date(task.dueDate);
  const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

  let urgencyColor = "border-zinc-700/50 bg-zinc-800/40"; // Default
  let glowColor = "rgba(255,255,255,0)";

  if (!task.isCompleted) {
    if (diffHours < 0) {
      urgencyColor = "border-red-900/50 bg-red-950/30"; // Overdue
    } else if (diffHours < 24) {
      urgencyColor = "border-orange-500/50 bg-orange-950/30"; // Critical
      glowColor = "rgba(249, 115, 22, 0.1)";
    } else if (diffHours < 72) {
      urgencyColor = "border-yellow-600/50 bg-yellow-950/20"; // Warning
    } else {
        urgencyColor = "border-blue-500/30 bg-blue-950/20"; // Safe
    }
  } else {
      urgencyColor = "border-emerald-800/30 bg-emerald-950/20 opacity-75"; // Completed
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`relative group rounded-2xl border ${urgencyColor} backdrop-blur-md shadow-lg overflow-hidden transition-colors duration-500`}
      style={{ boxShadow: `0 0 20px ${glowColor}` }}
    >
      {/* ProgressBar (Top Border) */}
      {!task.isCompleted && diffHours > 0 && diffHours < 24 && (
        <motion.div 
          className="absolute top-0 left-0 h-1 bg-gradient-to-r from-orange-500 to-red-600 z-10"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: diffHours * 60 * 60, ease: "linear" }}
        />
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          
          {/* Checkbox Section */}
          <button
            onClick={() => onToggleComplete(task.id)}
            className="mt-1 text-zinc-400 hover:text-emerald-400 transition-colors flex-shrink-0"
          >
            {task.isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : (
              <Circle className="w-6 h-6" />
            )}
          </button>

          {/* Main Content */}
          <div className="flex-1 min-w-0" onClick={() => setIsExpanded(!isExpanded)}>
             <div className="flex justify-between items-start">
                <h3 className={`text-lg font-semibold truncate pr-2 ${task.isCompleted ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                    {task.title}
                </h3>
                {/* Priority Badge */}
                {!task.isCompleted && (
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border 
                        ${task.priority === Priority.CRITICAL ? 'bg-red-500/20 text-red-300 border-red-500/30' : 
                          task.priority === Priority.HIGH ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                          task.priority === Priority.MEDIUM ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                          'bg-zinc-700/30 text-zinc-400 border-zinc-600/30'
                        }`}>
                        {PRIORITY_MAP[task.priority]}
                    </span>
                )}
             </div>

            <div className="flex items-center gap-4 mt-2 text-zinc-400 text-sm">
                <Countdown targetDate={task.dueDate} isCompleted={task.isCompleted} />
                <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{format(new Date(task.dueDate), 'MM月dd日 HH:mm')}</span>
                </div>
            </div>

            {/* Tags preview */}
            {task.tags.length > 0 && (
                 <div className="flex gap-2 mt-3">
                    {task.tags.map(tag => (
                        <span key={tag} className="text-xs text-zinc-500 bg-zinc-900/50 px-2 py-1 rounded-md">#{tag}</span>
                    ))}
                 </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
                onClick={() => onDelete(task.id)}
                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
                <Trash2 className="w-4 h-4" />
            </button>
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expandable Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-white/5">
                <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed text-sm">
                    {task.description || "暂无描述"}
                </p>

                {task.resources.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">相关资料</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {task.resources.map(link => (
                                <a 
                                    key={link.id}
                                    href={link.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900/50 hover:bg-blue-500/10 hover:border-blue-500/30 border border-transparent transition-all group/link"
                                >
                                    <div className="p-1.5 rounded-md bg-zinc-800 text-zinc-400 group-hover/link:text-blue-400 transition-colors">
                                        <LinkIcon className="w-3 h-3" />
                                    </div>
                                    <span className="text-sm text-zinc-300 truncate">{link.title}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-4 flex justify-between items-center text-xs text-zinc-600">
                    <span>创建于 {format(new Date(task.createdAt), 'yyyy年MM月dd日')}</span>
                    {task.completedAt && <span>完成于 {format(new Date(task.completedAt), 'yyyy年MM月dd日')}</span>}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TaskCard;