import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Tag, User, AlertCircle } from 'lucide-react';

export default function TaskDetailModal({ task, assignableUsers = [], onClose, onSave }) {
  const [editedTask, setEditedTask] = useState({ ...task });

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  if (!task) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(editedTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-slate-500 bg-slate-200 px-2 py-1 rounded">{editedTask.id.toUpperCase()}</span>
            <input 
              name="summary"
              value={editedTask.summary}
              onChange={handleChange}
              className="bg-transparent border-none outline-none text-xl font-semibold text-slate-800 placeholder-slate-400 w-full focus:ring-2 focus:ring-primary-500/50 rounded px-2 py-1"
              placeholder="Task summary..."
            />
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded hover:bg-slate-200">
            <X size={20} />
          </button>
        </div>

        {/* Body Layout */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          {/* Main Content (Left) */}
          <div className="flex-1 p-6 overflow-y-auto border-r border-slate-200">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</h3>
            <textarea
              name="description"
              value={editedTask.description}
              onChange={handleChange}
              rows={6}
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm text-slate-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-y"
              placeholder="Add a description..."
            />

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MessageSquare size={16}/> Comments
              </h3>
              <div className="text-slate-500 text-sm italic p-4 border border-dashed border-slate-300 rounded-lg text-center">
                Comments feature coming soon...
              </div>
            </div>
          </div>

          {/* Sidebar Attributes (Right) */}
          <div className="w-full md:w-72 bg-slate-50 p-6 overflow-y-auto space-y-6">
            
            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2 mb-2"><Tag size={14}/> Status</label>
              <select name="status" value={editedTask.status} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded p-2 text-sm text-slate-700 focus:outline-none focus:border-primary-500">
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Done">Done</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2 mb-2"><User size={14}/> Assignee</label>
              <select name="assignee" value={editedTask.assignee} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded p-2 text-sm text-slate-700 focus:outline-none focus:border-primary-500">
                <option value="Unassigned">Unassigned</option>
                {assignableUsers.map(username => (
                  <option key={username} value={username}>{username}</option>
                ))}
              </select>
            </div>

            {/* Reporter */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2 mb-2"><User size={14}/> Reporter</label>
              <select name="reporter" value={editedTask.reporter} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded p-2 text-sm text-slate-700 focus:outline-none focus:border-primary-500">
                <option value="System">System</option>
                {assignableUsers.map(username => (
                  <option key={username} value={username}>{username}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2 mb-2"><AlertCircle size={14}/> Priority</label>
              <select name="priority" value={editedTask.priority} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded p-2 text-sm text-slate-700 focus:outline-none focus:border-primary-500">
                <option value="Highest">Highest</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2 mb-2"><Tag size={14}/> Type</label>
              <select name="type" value={editedTask.type} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded p-2 text-sm text-slate-700 focus:outline-none focus:border-primary-500">
                <option value="Task">Task</option>
                <option value="Bug">Bug</option>
                <option value="Story">Story</option>
              </select>
            </div>

          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded text-sm font-medium bg-primary-600 hover:bg-primary-500 text-white shadow-md transition-colors">
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
