import React from 'react';
import { AppContext, AppContextDefaultValue } from '../contexts/app-context';

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppContext.Provider value={AppContextDefaultValue}>
      {children}
    </AppContext.Provider>
  );
};
