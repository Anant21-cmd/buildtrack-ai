import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const MarketPriceContext = createContext();

export function MarketPriceProvider({ children }) {
  const [marketPrices, setMarketPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const fetchMarketPrices = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/market-prices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setMarketPrices(data);
    } catch (err) {
      console.error('Failed to fetch market prices', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchMarketPrices();
  }, [token, fetchMarketPrices]);

  return (
    <MarketPriceContext.Provider value={{ marketPrices, loading, fetchMarketPrices }}>
      {children}
    </MarketPriceContext.Provider>
  );
}

export function useMarketPrices() {
  const context = useContext(MarketPriceContext);
  if (!context) {
    throw new Error('useMarketPrices must be used within a MarketPriceProvider');
  }
  return context;
}

