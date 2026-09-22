import React from 'react';
import { useTasks } from '../../context/TaskContext';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';

const TaskList = () => {
  const { tasks, updateTaskStatus } = useTasks();

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'primary';
      case 'Pending': return 'warning';
      default: return 'neutral';
    }
  };

  const columns = [
    { header: 'Title', accessor: 'title' },
    { header: 'Project ID', accessor: 'projectId' },
    { header: 'Assignee', accessor: 'assignee' },
    { header: 'Due Date', accessor: 'dueDate' },
    { header: 'Status', accessor: 'status', render: row => <Badge variant={getStatusBadge(row.status)}>{row.status}</Badge> },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row) => (
        <select value={row.status} onChange={e => updateTaskStatus(row.id, e.target.value)}>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      )
    }
  ];

  return (
    <div className="page-container">
      <h1 className="page-title">Site Tasks</h1>
      <Card><Table columns={columns} data={tasks} /></Card>
    </div>
  );
};
export default TaskList;

