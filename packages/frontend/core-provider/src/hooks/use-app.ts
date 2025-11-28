import { useContext } from 'react';
import { AppContext, AppContextValue } from '../contexts/app-context';

export const useApp = (): AppContextValue => {
  if (!AppContext) {
    throw new Error('useApp must be used within an AppProvider');
  }

  return useContext(AppContext);
};
