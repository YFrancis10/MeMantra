import React, { createContext, useState, useContext } from 'react';
import { Mantra } from '../services/mantra.service';

type SavedContextType = {
  savedMantras: Mantra[];
  setSavedMantras: React.Dispatch<React.SetStateAction<Mantra[]>>;
};

const SavedContext = createContext<SavedContextType | undefined>(undefined);

export const SavedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedMantras, setSavedMantras] = useState<Mantra[]>([]);
  return (
    <SavedContext.Provider value={{ savedMantras, setSavedMantras }}>
      {children}
    </SavedContext.Provider>
  );
};

export const useSavedMantras = () => {
  const context = useContext(SavedContext);
  if (!context) throw new Error('useSavedMantras must be used within SavedProvider');
  return context;
};
