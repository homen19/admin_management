import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Bug, CheckSquare, Bookmark, AlertCircle, ArrowUpCircle, ArrowDownCircle, Minus } from 'lucide-react';

const getTypeIcon = (type) => {
  switch (type) {
    case 'Bug': return <Bug className="w-4 h-4 text-red-500" />;
    case 'Task': return <CheckSquare className="w-4 h-4 text-blue-500" />;
    case 'Story': return <Bookmark className="w-4 h-4 text-green-500" />;
    default: return <CheckSquare className="w-4 h-4 text-slate-400" />;
  }
};

const getPriorityIcon = (priority) => {
  switch (priority) {
    case 'Highest': return <AlertCircle className="w-4 h-4 text-red-600" />;
    case 'High': return <ArrowUpCircle className="w-4 h-4 text-red-400" />;
    case 'Medium': return <Minus className="w-4 h-4 text-orange-400" />;
    case 'Low': return <ArrowDownCircle className="w-4 h-4 text-blue-400" />;
    default: return <Minus className="w-4 h-4 text-slate-400" />;
  }
};

const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

export default function KanbanTask({ task, index, onClick }) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`
            bg-white p-3 mb-2 rounded-lg border shadow-sm
            hover:border-slate-300 hover:shadow-md cursor-grab active:cursor-grabbing
            ${snapshot.isDragging ? 'border-primary-500 shadow-xl opacity-95 ring-1 ring-primary-500' : 'border-slate-200'}
          `}
        >
          <div className="text-sm font-medium text-slate-800 mb-2 line-clamp-2">
            {task.summary}
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <span title={task.type}>{getTypeIcon(task.type)}</span>
              <span title={task.priority}>{getPriorityIcon(task.priority)}</span>
              <span className="text-xs text-slate-500 ml-1 font-mono">{task.id.toUpperCase()}</span>
            </div>
            <div 
              className="w-6 h-6 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center text-[10px] font-bold text-primary-700"
              title={`Assignee: ${task.assignee}`}
            >
              {getInitials(task.assignee)}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
