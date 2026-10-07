import React, { createContext, useContext, useState } from 'react';

const ProgressContext = createContext();
export const useProgress = () => useContext(ProgressContext);

export const ProgressProvider = ({ children }) => {
  const [dprs, setDprs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDprs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('buildtrack_token');
      const res = await fetch('/api/progress', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDprs(data);
      }
    } catch (err) {
      console.error('Error fetching DPRs:', err);
    } finally {
      setLoading(false);
    }
  };

  const addDPR = async (dpr) => {
    try {
      const token = localStorage.getItem('buildtrack_token');
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(dpr)
      });
      if (res.ok) {
        const newDpr = await res.json();
        setDprs([...dprs, newDpr]);
        return newDpr;
      }
    } catch (err) {
      console.error('Error adding DPR:', err);
      throw err;
    }
  };

  React.useEffect(() => {
    const token = localStorage.getItem('buildtrack_token');
    if (token) fetchDprs();
  }, []);

  return (
    <ProgressContext.Provider value={{ dprs, loading, addDPR, fetchDprs }}>
      {children}
    </ProgressContext.Provider>
  );
};

