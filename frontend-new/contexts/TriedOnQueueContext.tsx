import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TriedOnItem } from '@/components/TriedOnSheet';

interface TriedOnQueueContextType {
  triedOnQueue: TriedOnItem[];
  addToTriedOnQueue: (item: TriedOnItem) => void;
  removeFromTriedOnQueue: (ids: string[]) => void;
  clearTriedOnQueue: () => void;
}

const TriedOnQueueContext = createContext<TriedOnQueueContextType | undefined>(undefined);

export const useTriedOnQueue = () => {
  const context = useContext(TriedOnQueueContext);
  if (!context) {
    throw new Error('useTriedOnQueue must be used within a TriedOnQueueProvider');
  }
  return context;
};

interface TriedOnQueueProviderProps {
  children: ReactNode;
}

export const TriedOnQueueProvider: React.FC<TriedOnQueueProviderProps> = ({ children }) => {
  const [triedOnQueue, setTriedOnQueue] = useState<TriedOnItem[]>([]);

  const addToTriedOnQueue = (item: TriedOnItem) => {
    console.log('addToTriedOnQueue called with item:', item);
    setTriedOnQueue(prev => {
      const newQueue = [item, ...prev];
      console.log('New queue after add:', newQueue);
      return newQueue;
    });
  };

  const removeFromTriedOnQueue = (ids: string[]) => {
    console.log('removeFromTriedOnQueue called with ids:', ids);
    setTriedOnQueue(prev => {
      const newQueue = prev.filter(item => !ids.includes(item.id));
      console.log('New queue after remove:', newQueue);
      return newQueue;
    });
  };

  const clearTriedOnQueue = () => {
    setTriedOnQueue([]);
  };

  return (
    <TriedOnQueueContext.Provider
      value={{
        triedOnQueue,
        addToTriedOnQueue,
        removeFromTriedOnQueue,
        clearTriedOnQueue,
      }}
    >
      {children}
    </TriedOnQueueContext.Provider>
  );
};
