import React, { createContext, useContext, useState } from 'react';

const TaskContext = createContext();
export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  const addTask = (task) => setTasks([...tasks, { ...task, id: `t${tasks.length + 1}`, status: 'Pending' }]);
  const updateTaskStatus = (id, status) => setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTaskStatus }}>
      {children}
    </TaskContext.Provider>
  );
};

