/**
 * Operator Theme Hook
 * Access operator theme configuration from context
 */

import { useContext } from 'react';
import { OperatorThemeContext } from '../contexts/operator-theme-context';

export function useOperatorTheme() {
  const context = useContext(OperatorThemeContext);

  if (!context) {
    throw new Error(
      'useOperatorTheme must be used within an OperatorThemeProvider'
    );
  }

  return context;
}
