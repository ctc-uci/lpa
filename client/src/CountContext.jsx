import { createContext, useState, useEffect, useContext } from 'react';
import { useBackendContext } from "./contexts/hooks/useBackendContext";

const CountContext = createContext({count: 0});

export function useCount() {
  return useContext(CountContext);
}

export function CountProvider({ children }) {
  const { backend } = useBackendContext();
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetchCount();
  }, []);

  const fetchCount = async () => {
    try {
      const response = await backend.get('/invoices/notificationCount');
      setCount(response.data[0].notificationcount);
    } catch (error) {
      console.error('Error fetching count:', error);
    }
  };

  return (
    <CountContext.Provider value={{ count, fetchCount }}>
      {children}
    </CountContext.Provider>
  );
}
