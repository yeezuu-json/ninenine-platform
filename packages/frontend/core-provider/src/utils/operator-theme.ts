/**
 * Operator Theme Utilities
 * Helper functions for operator theme management
 */

/**
 * Get operator ID from multiple sources (subdomain, URL param, env var)
 */
export function getOperatorId(): string | undefined {
  // Option 1: From subdomain (e.g., operator1.yourgame.com)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    // Check if subdomain exists and is not common values
    if (
      parts.length >= 3 &&
      !['www', 'localhost', 'app', 'admin'].includes(parts[0])
    ) {
      return parts[0];
    }

    // Option 2: From URL parameter (?operator=xxx)
    const params = new URLSearchParams(window.location.search);
    const operatorParam = params.get('operator');
    if (operatorParam) {
      return operatorParam;
    }
  }

  // Option 3: From environment variable (for development/testing)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const env = (import.meta as any).env;
    if (env?.VITE_OPERATOR_ID) {
      return env.VITE_OPERATOR_ID;
    }
  } catch {
    // import.meta.env not available
  }

  return undefined;
}

/**
 * Convert hex color to oklch format
 */
export function hexToOklch(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // This is a simplified conversion - in production, use a proper color library
  // like 'culori' for accurate oklch conversion
  return `oklch(${(r + g + b) / 3} 0.1 ${
    (Math.atan2(b - g, r - g) * 180) / Math.PI
  })`;
}

/**
 * Validate if a string is a valid color format (hex, rgb, oklch)
 */
export function isValidColor(color: string): boolean {
  // Hex format
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
    return true;
  }

  // RGB/RGBA format
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/.test(color)) {
    return true;
  }

  // OKLCH format
  if (/^oklch\(.+\)$/.test(color)) {
    return true;
  }

  return false;
}

/**
 * Create a default theme configuration
 */
export function createDefaultTheme(operatorId: string) {
  return {
    operatorId,
    operatorName: operatorId,
    colors: {
      primary: 'oklch(0.205 0 0)',
      secondary: 'oklch(0.97 0 0)',
      accent: 'oklch(0.97 0 0)',
      background: 'oklch(1 0 0)',
      surface: 'oklch(1 0 0)',
      text: 'oklch(0.145 0 0)',
      border: 'oklch(0.922 0 0)',
    },
  };
}
