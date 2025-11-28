/**
 * Operator Theme Context
 * Provides operator-specific theme configuration to all child components
 */

import { createContext } from 'react';
import type { OperatorThemeContextValue } from '../types/theme';

export const OperatorThemeContext = createContext<OperatorThemeContextValue>({
  theme: null,
  loading: false,
  error: null,
  applyTheme: () => {},
  resetTheme: () => {},
});
