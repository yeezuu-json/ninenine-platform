/**
 * Operator Theme Provider
 * Manages operator-specific theming with dynamic CSS variable injection
 */

'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { OperatorThemeContext } from '../contexts/operator-theme-context';
import type { OperatorThemeConfig } from '../types/theme';

interface OperatorThemeProviderProps {
  children: React.ReactNode;
  operatorId?: string;
  apiBaseUrl?: string;
  defaultTheme?: Partial<OperatorThemeConfig>;
  onThemeLoaded?: (theme: OperatorThemeConfig) => void;
  onThemeError?: (error: Error) => void;
}

export function OperatorThemeProvider({
  children,
  operatorId,
  apiBaseUrl = '/api/v1',
  defaultTheme,
  onThemeLoaded,
  onThemeError,
}: OperatorThemeProviderProps) {
  const [theme, setTheme] = useState<OperatorThemeConfig | null>(null);
  const [loading, setLoading] = useState(!!operatorId);
  const [error, setError] = useState<Error | null>(null);

  const applyTheme = useCallback((themeConfig: OperatorThemeConfig) => {
    const root = document.documentElement;

    // Apply operator colors as CSS custom properties
    if (themeConfig.colors) {
      root.style.setProperty('--operator-primary', themeConfig.colors.primary);
      root.style.setProperty(
        '--operator-secondary',
        themeConfig.colors.secondary
      );
      root.style.setProperty('--operator-accent', themeConfig.colors.accent);
      root.style.setProperty(
        '--operator-background',
        themeConfig.colors.background
      );
      root.style.setProperty('--operator-surface', themeConfig.colors.surface);
      root.style.setProperty('--operator-text', themeConfig.colors.text);
      root.style.setProperty('--operator-border', themeConfig.colors.border);
    }

    // Apply custom fonts
    if (themeConfig.fonts?.heading) {
      root.style.setProperty('--font-heading', themeConfig.fonts.heading);
    }
    if (themeConfig.fonts?.body) {
      root.style.setProperty('--font-body', themeConfig.fonts.body);
    }

    // Update favicon
    if (themeConfig.logo?.favicon) {
      let favicon = document.querySelector(
        "link[rel='icon']"
      ) as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = themeConfig.logo.favicon;
    }

    // Update page title
    if (themeConfig.brandName) {
      document.title = themeConfig.brandName;
    }

    // Load custom CSS if provided
    if (themeConfig.customCss) {
      let customStyleLink = document.getElementById(
        'operator-custom-css'
      ) as HTMLLinkElement;
      if (!customStyleLink) {
        customStyleLink = document.createElement('link');
        customStyleLink.id = 'operator-custom-css';
        customStyleLink.rel = 'stylesheet';
        document.head.appendChild(customStyleLink);
      }
      customStyleLink.href = themeConfig.customCss;
    }

    setTheme(themeConfig);
  }, []);

  const resetTheme = useCallback(() => {
    const root = document.documentElement;
    const operatorVars = [
      '--operator-primary',
      '--operator-secondary',
      '--operator-accent',
      '--operator-background',
      '--operator-surface',
      '--operator-text',
      '--operator-border',
      '--font-heading',
      '--font-body',
    ];

    operatorVars.forEach((varName) => {
      root.style.removeProperty(varName);
    });

    // Remove custom CSS
    const customStyleLink = document.getElementById('operator-custom-css');
    if (customStyleLink) {
      customStyleLink.remove();
    }

    setTheme(null);
  }, []);

  useEffect(() => {
    if (!operatorId) {
      setLoading(false);
      return;
    }

    // Fetch theme from API
    const fetchTheme = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${apiBaseUrl}/operators/${operatorId}/theme`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch operator theme: ${response.statusText}`
          );
        }

        const data = await response.json();
        const themeConfig: OperatorThemeConfig = {
          operatorId: data.operatorId,
          operatorName: data.operatorName,
          colors: data.theme.colors,
          logo: data.theme.logo,
          fonts: data.theme.fonts,
          brandName: data.theme.brandName,
          customCss: data.theme.customCss,
        };

        applyTheme(themeConfig);
        onThemeLoaded?.(themeConfig);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Unknown error occurred');
        console.error('Failed to load operator theme:', error);
        setError(error);
        onThemeError?.(error);

        // Apply default theme if provided
        if (defaultTheme && defaultTheme.colors) {
          const fallbackTheme: OperatorThemeConfig = {
            operatorId: operatorId,
            operatorName: defaultTheme.operatorName || 'Default Operator',
            colors: defaultTheme.colors as OperatorThemeConfig['colors'],
            logo: defaultTheme.logo,
            fonts: defaultTheme.fonts,
            brandName: defaultTheme.brandName,
            customCss: defaultTheme.customCss,
          };
          applyTheme(fallbackTheme);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();
  }, [
    operatorId,
    apiBaseUrl,
    applyTheme,
    defaultTheme,
    onThemeLoaded,
    onThemeError,
  ]);

  const contextValue = useMemo(
    () => ({
      theme,
      loading,
      error,
      applyTheme,
      resetTheme,
    }),
    [theme, loading, error, applyTheme, resetTheme]
  );

  return (
    <OperatorThemeContext.Provider value={contextValue}>
      {children}
    </OperatorThemeContext.Provider>
  );
}

// Legacy ThemeProvider for next-themes compatibility
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
