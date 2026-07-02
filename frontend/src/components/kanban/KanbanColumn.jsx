import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import KanbanTask from './KanbanTask';

export default function KanbanColumn({ column, tasks, onTaskClick }) {
  return (
    <div className="flex flex-col w-80 min-w-[320px] bg-slate-100/70 rounded-xl border border-slate-200 overflow-hidden h-full max-h-full shadow-sm">
      <div className="p-3 border-b border-slate-200 bg-slate-100 flex items-center justify-between sticky top-0 z-10">
        <h3 className="font-semibold text-slate-800 text-sm">{column.title}</h3>
        <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2 overflow-y-auto min-h-[150px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-slate-200/50' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <KanbanTask key={task.id} task={task} index={index} onClick={onTaskClick} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
