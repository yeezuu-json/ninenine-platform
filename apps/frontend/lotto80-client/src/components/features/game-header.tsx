import { ModeToggle } from '@ninenine-platform/ui/components/ui/mode-toggle';
import { useOperatorTheme } from '@ninenine/core-provider';
import { cn } from '@ninenine-platform/ui/lib/utils';

export default function GameHeader() {
  const { theme, loading } = useOperatorTheme();

  if (loading) {
    return (
      <header className="h-16 border-b border-operator-border bg-operator-surface flex items-center justify-center">
        <div className="animate-pulse text-operator-text">Loading...</div>
      </header>
    );
  }

  return (
    <header className="w-full h-16 border-b border-operator-border bg-operator-surface px-4 flex items-center justify-between">
      {/* Operator Logo */}
      <div className="flex items-center gap-3">
        {theme?.logo?.url ? (
          <img
            src={theme.logo.url}
            alt={theme.brandName || theme.operatorName}
            className={cn(
              'h-10 object-contain',
              theme.logo.width && `w-${theme.logo.width}`,
              theme.logo.height && `h-${theme.logo.height}`
            )}
          />
        ) : (
          <div className="h-10 w-10 rounded bg-operator-primary flex items-center justify-center">
            <span className="text-white font-bold text-xl">
              {theme?.operatorName?.[0] || 'L'}
            </span>
          </div>
        )}

        {/* Brand Name */}
        <h1 className="text-xl font-bold text-operator-primary">
          {theme?.brandName || theme?.operatorName || 'Lotto 80'}
        </h1>
      </div>

      {/* Right side - could add user menu, balance, etc */}
      <div className="flex items-center gap-4">
        <ModeToggle />
        <div className="text-sm text-operator-text">
          {theme?.operatorName && (
            <span className="opacity-60">Powered by {theme.operatorName}</span>
          )}
        </div>
      </div>
    </header>
  );
}
