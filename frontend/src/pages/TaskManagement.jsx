import React, { useState, useEffect } from 'react';
import KanbanBoard from '../components/kanban/KanbanBoard';
import TaskDetailModal from '../components/kanban/TaskDetailModal';
import { kanbanAPI } from '../services/kanbanService';
import { Plus, Filter, Search } from 'lucide-react';

const emptyBoard = {
  tasks: {},
  columns: {
    'column-1': { id: 'column-1', title: 'To Do', taskIds: [] },
    'column-2': { id: 'column-2', title: 'In Progress', taskIds: [] },
    'column-3': { id: 'column-3', title: 'In Review', taskIds: [] },
    'column-4': { id: 'column-4', title: 'Done', taskIds: [] },
  },
  columnOrder: ['column-1', 'column-2', 'column-3', 'column-4'],
};

export default function TaskManagement() {
  const [data, setData] = useState(emptyBoard);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [assignableUsers, setAssignableUsers] = useState([]);

  const fetchTasksAndUsers = async () => {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        kanbanAPI.getAllTasks(),
        kanbanAPI.getUsers()
      ]);
      const backendTasks = tasksRes.data;
      setAssignableUsers(usersRes.data);
      
      const newBoard = JSON.parse(JSON.stringify(emptyBoard)); // deep copy
      
      backendTasks.forEach(task => {
        // Map backend taskId to frontend id to be safe, or just use taskId directly
        task.id = task.taskId;
        newBoard.tasks[task.id] = task;
        
        // Find correct column
        const col = Object.values(newBoard.columns).find(c => c.title === task.status);
        if (col) {
          col.taskIds.push(task.id);
        } else {
          // default to To Do
          newBoard.columns['column-1'].taskIds.push(task.id);
        }
      });
      
      setData(newBoard);
    } catch (err) {
      console.error("Failed to load tasks and users", err);
    }
  };

  useEffect(() => {
    fetchTasksAndUsers();
  }, []);

  const handleCreateTask = () => {
    const newId = `new-${Date.now()}`; // Temporary ID until saved
    setSelectedTask({
      id: newId,
      taskId: '',
      summary: '',
      description: '',
      status: 'To Do',
      assignee: 'Unassigned',
      reporter: 'Admin',
      priority: 'Medium',
      type: 'Task',
    });
  };

  const handleSaveTask = async (updatedTask) => {
    try {
      if (updatedTask.id.startsWith('new-')) {
        // Create new
        const { id, ...taskPayload } = updatedTask;
        await kanbanAPI.createTask(taskPayload);
      } else {
        // Update existing
        await kanbanAPI.updateTask(updatedTask.taskId, updatedTask);
      }
      setSelectedTask(null);
      fetchTasksAndUsers(); // Refresh board
    } catch (err) {
      console.error("Failed to save task", err);
      alert("Failed to save task.");
    }
  };

  const handleTaskMove = async (movedTask) => {
    try {
      await kanbanAPI.updateTask(movedTask.taskId, movedTask);
    } catch (err) {
      console.error("Failed to update task status", err);
      fetchTasksAndUsers(); // Revert board if failed
    }
  };

  return (
    <div className="p-6 h-full flex flex-col animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            Staff Task Board
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage and assign tasks across the team</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..." 
              className="pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 shadow-sm"
            />
          </div>
          <button 
            className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            onClick={() => alert("Filter options panel would open here.")}
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button 
            onClick={handleCreateTask}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-primary-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard 
          data={data} 
          setData={setData} 
          searchQuery={searchQuery}
          onTaskClick={setSelectedTask} 
          onTaskMove={handleTaskMove}
        />
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          assignableUsers={assignableUsers}
          onClose={() => setSelectedTask(null)}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}
