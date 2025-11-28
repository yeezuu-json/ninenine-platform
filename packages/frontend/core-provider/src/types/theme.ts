/**
 * Operator Theme Types
 * Defines the structure for operator-specific theming
 */

export interface OperatorThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  border: string;
}

export interface OperatorLogo {
  url: string;
  favicon?: string;
  width?: number;
  height?: number;
}

export interface OperatorFonts {
  heading?: string;
  body?: string;
}

export interface OperatorThemeConfig {
  operatorId: string;
  operatorName: string;
  colors: OperatorThemeColors;
  logo?: OperatorLogo;
  fonts?: OperatorFonts;
  brandName?: string;
  customCss?: string; // URL to custom CSS file
}

export interface OperatorThemeContextValue {
  theme: OperatorThemeConfig | null;
  loading: boolean;
  error: Error | null;
  applyTheme: (theme: OperatorThemeConfig) => void;
  resetTheme: () => void;
}
