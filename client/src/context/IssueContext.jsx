import React, { createContext, useContext, useState } from 'react';

const IssueContext = createContext();

export const useIssues = () => useContext(IssueContext);

export const IssueProvider = ({ children }) => {
  const [issues, setIssues] = useState([]);

  const addIssue = (issue) => {
    setIssues([
      ...issues,
      { ...issue, id: `iss${issues.length + 1}`, status: 'Open', date: new Date().toISOString().split('T')[0] }
    ]);
  };

  const updateIssueStatus = (id, newStatus) => {
    setIssues(issues.map(iss => iss.id === id ? { ...iss, status: newStatus } : iss));
  };

  return (
    <IssueContext.Provider value={{ issues, addIssue, updateIssueStatus }}>
      {children}
    </IssueContext.Provider>
  );
};

