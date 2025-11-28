import { useContext } from 'react';
import { BetModalContext } from './bet-modal';

export function useBetModal() {
  const context = useContext(BetModalContext);
  if (context === undefined) {
    throw new Error('useBetModal must be used within a BetModalProvider');
  }
  return context;
}
