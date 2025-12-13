// context/savedContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Mantra } from '../services/mantra.service';
import { storage } from '../utils/storage';
import { mantraService } from '../services/mantra.service';

type SavedContextType = {
  savedMantras: Mantra[];
  setSavedMantras: React.Dispatch<React.SetStateAction<Mantra[]>>;
  loadSavedMantras: () => Promise<void>;
};

const SavedContext = createContext<SavedContextType | undefined>(undefined);

export const SavedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedMantras, setSavedMantras] = useState<Mantra[]>([]);

  const loadSavedMantras = async () => {
    try {
      const token = await storage.getToken();
      const res = await mantraService.getSavedMantras(token || 'mock-token');
      setSavedMantras(res);
    } catch (err) {
      console.log('Error fetching saved mantras:', err);
    }
  };

  //load saved mantras on mount
  useEffect(() => {
    loadSavedMantras();
  }, []);

  return (
    <SavedContext.Provider value={{ savedMantras, setSavedMantras, loadSavedMantras }}>
      {children}
    </SavedContext.Provider>
  );
};

export const useSavedMantras = () => {
  const context = useContext(SavedContext);
  if (!context) throw new Error('useSavedMantras must be used within SavedProvider');
  return context;
};
