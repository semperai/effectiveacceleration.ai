'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface CacheInvalidationContextType {
  timestamp: number;
  invalidate: () => void;
}

const CacheInvalidationContext = createContext<CacheInvalidationContextType | undefined>(undefined);

export function CacheInvalidationProvider({ children }: { children: ReactNode }) {
  const [timestamp, setTimestamp] = useState(Date.now());

  const invalidate = useCallback(() => {
    setTimestamp(Date.now());
  }, []);

  return (
    <CacheInvalidationContext.Provider value={{ timestamp, invalidate }}>
      {children}
    </CacheInvalidationContext.Provider>
  );
}

export function useCacheInvalidation() {
  const context = useContext(CacheInvalidationContext);
  if (context === undefined) {
    throw new Error('useCacheInvalidation must be used within a CacheInvalidationProvider');
  }
  return context;
}
