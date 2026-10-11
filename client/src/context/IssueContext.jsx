import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const IssueContext = createContext();

export const useIssues = () => useContext(IssueContext);

export const IssueProvider = ({ children }) => {
  const [issues, setIssues] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchIssues();
    } else {
      setIssues([]);
    }
  }, [currentUser]);

  const fetchIssues = async () => {
    try {
      const res = await fetch('/api/issues', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('buildtrack_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIssues(data);
      }
    } catch (err) {
      console.error('Error fetching issues:', err);
    }
  };

  const addIssue = async (issueData) => {
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('buildtrack_token')}` 
        },
        body: JSON.stringify(issueData)
      });
      if (res.ok) {
        const newIssue = await res.json();
        setIssues([...issues, newIssue]);
      }
    } catch (err) {
      console.error('Error adding issue:', err);
    }
  };

  const updateIssueStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('buildtrack_token')}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updatedIssue = await res.json();
        setIssues(issues.map(iss => iss.id === id ? updatedIssue : iss));
      }
    } catch (err) {
      console.error('Error updating issue status:', err);
    }
  };

  return (
    <IssueContext.Provider value={{ issues, fetchIssues, addIssue, updateIssueStatus }}>
      {children}
    </IssueContext.Provider>
  );
};
