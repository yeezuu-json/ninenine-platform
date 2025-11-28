/**
 * Operator Theme Usage Examples
 *
 * This file demonstrates how to use operator-specific theming in your components
 */

import { useOperatorTheme } from '@ninenine/core-provider';
import { cn } from '@ninenine-platform/ui/lib/utils';

/**
 * Example 1: Using operator colors in Tailwind classes
 */
export function ThemedButton() {
  return (
    <button className="bg-operator-primary text-white hover:bg-operator-accent px-4 py-2 rounded">
      Place Bet
    </button>
  );
}

/**
 * Example 2: Accessing theme data via hook
 */
export function ThemedHeader() {
  const { theme, loading } = useOperatorTheme();

  if (loading) return <div>Loading theme...</div>;

  return (
    <header className="bg-operator-surface border-b border-operator-border">
      {theme?.logo?.url && (
        <img src={theme.logo.url} alt={theme.brandName} className="h-12" />
      )}
      <h1 className="text-operator-primary text-2xl font-bold">
        {theme?.brandName || 'Lotto 80'}
      </h1>
    </header>
  );
}

/**
 * Example 3: Conditional styling based on operator
 */
export function ThemedCard() {
  const { theme } = useOperatorTheme();

  return (
    <div
      className={cn(
        'p-4 rounded-lg border',
        'bg-operator-surface border-operator-border',
        theme?.operatorId === 'premium-casino' && 'shadow-2xl' // Special styling for specific operator
      )}
    >
      <h3 className="text-operator-primary font-bold">Game Round</h3>
      <p className="text-operator-text">Content here</p>
    </div>
  );
}

/**
 * Example 4: Using inline styles with operator colors
 */
export function ThemedProgressBar({ progress }: { progress: number }) {
  const { theme } = useOperatorTheme();

  return (
    <div
      className="h-2 bg-operator-surface rounded-full overflow-hidden"
      style={{
        borderColor: theme?.colors.border,
      }}
    >
      <div
        className="h-full transition-all duration-300"
        style={{
          width: `${progress}%`,
          backgroundColor: theme?.colors.primary || '#3b82f6',
        }}
      />
    </div>
  );
}

/**
 * Example 5: Theme-aware countdown timer colors
 */
export function ThemedCountdownRing({ isUrgent }: { isUrgent: boolean }) {
  return (
    <svg className="w-16 h-16">
      <circle
        className={cn(
          isUrgent ? 'text-red-500' : 'text-operator-primary', // Use operator primary unless urgent
          'transition-colors duration-300'
        )}
        strokeWidth="3"
        fill="none"
        stroke="currentColor"
      />
    </svg>
  );
}

/**
 * Example 6: Panel with operator branding
 */
export function ThemedBetPanel() {
  const { theme } = useOperatorTheme();

  return (
    <div className="bg-operator-surface border border-operator-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-operator-primary text-xl font-bold">
          Place Your Bet
        </h2>
        {theme?.logo?.url && (
          <img src={theme.logo.url} alt="" className="h-6 opacity-50" />
        )}
      </div>

      <div className="space-y-4">
        <button className="w-full bg-operator-primary text-white hover:bg-operator-accent py-3 rounded-lg font-semibold transition-colors">
          Confirm Bet
        </button>

        <button className="w-full bg-operator-surface text-operator-text border border-operator-border hover:bg-operator-accent hover:text-white py-3 rounded-lg font-semibold transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

/**
 * Available Tailwind Classes with Operator Theme:
 *
 * Colors:
 * - text-operator-primary
 * - text-operator-secondary
 * - text-operator-accent
 * - text-operator-background
 * - text-operator-surface
 * - text-operator-text
 * - text-operator-border
 *
 * Backgrounds:
 * - bg-operator-primary
 * - bg-operator-secondary
 * - bg-operator-accent
 * - bg-operator-background
 * - bg-operator-surface
 * - bg-operator-text
 * - bg-operator-border
 *
 * Borders:
 * - border-operator-primary
 * - border-operator-secondary
 * - border-operator-accent
 * - border-operator-background
 * - border-operator-surface
 * - border-operator-text
 * - border-operator-border
 *
 * All with standard Tailwind modifiers:
 * - hover:, focus:, active:, dark:, etc.
 */
