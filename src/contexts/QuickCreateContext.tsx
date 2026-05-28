'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface QuickCreateContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const QuickCreateContext = createContext<QuickCreateContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export function QuickCreateProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <QuickCreateContext.Provider value={{ isOpen, open, close }}>
      {children}
    </QuickCreateContext.Provider>
  );
}

export function useQuickCreate() {
  return useContext(QuickCreateContext);
}
