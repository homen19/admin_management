export const initialData = {
  tasks: {
    'task-1': { id: 'task-1', summary: 'Fix login page bug', type: 'Bug', priority: 'High', status: 'To Do', assignee: 'John Doe', reporter: 'Admin', description: 'The login page throws a 500 error when using special characters in the password.', comments: [] },
    'task-2': { id: 'task-2', summary: 'Implement Kanban Board', type: 'Story', priority: 'Medium', status: 'In Progress', assignee: 'Jane Smith', reporter: 'Manager', description: 'Create a Jira-style kanban board for staff.', comments: [] },
    'task-3': { id: 'task-3', summary: 'Update documentation', type: 'Task', priority: 'Low', status: 'In Review', assignee: 'Alice Johnson', reporter: 'Admin', description: 'Update the user manual with the new module features.', comments: [] },
    'task-4': { id: 'task-4', summary: 'Server maintenance', type: 'Task', priority: 'Highest', status: 'Done', assignee: 'Bob Williams', reporter: 'System', description: 'Perform routine monthly server maintenance.', comments: [] },
  },
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'To Do',
      taskIds: ['task-1'],
    },
    'column-2': {
      id: 'column-2',
      title: 'In Progress',
      taskIds: ['task-2'],
    },
    'column-3': {
      id: 'column-3',
      title: 'In Review',
      taskIds: ['task-3'],
    },
    'column-4': {
      id: 'column-4',
      title: 'Done',
      taskIds: ['task-4'],
    },
  },
  columnOrder: ['column-1', 'column-2', 'column-3', 'column-4'],
};
