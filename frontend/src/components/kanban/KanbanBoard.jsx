import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';

export default function KanbanBoard({ data, setData, searchQuery, onTaskClick, onTaskMove }) {
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startColumn = data.columns[source.droppableId];
    const finishColumn = data.columns[destination.droppableId];

    // Moving within the same column
    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...startColumn,
        taskIds: newTaskIds,
      };

      setData({
        ...data,
        columns: {
          ...data.columns,
          [newColumn.id]: newColumn,
        },
      });
      return;
    }

    // Moving from one column to another
    const startTaskIds = Array.from(startColumn.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = {
      ...startColumn,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finishColumn.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finishColumn,
      taskIds: finishTaskIds,
    };

    // Update the task's internal status to match the column title
    const updatedTask = {
      ...data.tasks[draggableId],
      status: finishColumn.title
    };

    setData({
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
      tasks: {
        ...data.tasks,
        [draggableId]: updatedTask
      }
    });

    if (onTaskMove) {
      onTaskMove(updatedTask);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)] overflow-x-auto pb-4">
      <DragDropContext onDragEnd={onDragEnd}>
        {data.columnOrder.map((columnId) => {
          const column = data.columns[columnId];
          const tasks = column.taskIds
            .map((taskId) => data.tasks[taskId])
            .filter(task => 
              task && 
              (searchQuery.trim() === '' || 
               task.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
               task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
               task.assignee.toLowerCase().includes(searchQuery.toLowerCase()))
            );

          return (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={tasks}
              onTaskClick={onTaskClick}
            />
          );
        })}
      </DragDropContext>
    </div>
  );
}
