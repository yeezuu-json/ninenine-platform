import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@ninenine-platform/ui/components/ui/dialog';
import { Button } from '@ninenine-platform/ui/components/ui/button';
import { Input } from '@ninenine-platform/ui/components/ui/input';
import { BetModalContext } from './bet-modal';
import { cn } from '@ninenine-platform/ui/lib/utils';

// Currency configurations
const CURRENCIES = [
  { currency: 'USD', values: [5, 10, 20, 50, 100], symbol: '$' },
  { currency: 'KHR', values: [5000, 10000, 20000, 50000, 100000], symbol: '៛' },
  { currency: 'THB', values: [50, 100, 500, 1000], symbol: '฿' },
  { currency: 'VND', values: [20000, 50000, 100000, 200000], symbol: '₫' },
];

export function BetModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [betType, setBetType] = useState('');
  const [roundId, setRoundId] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('KHR');

  const openBetModal = (type: string, round: string) => {
    setBetType(type);
    setRoundId(round);
    setAmount('');
    setIsOpen(true);
  };

  const closeBetModal = () => {
    setIsOpen(false);
    setBetType('');
    setRoundId('');
    setAmount('');
  };

  const handleChipClick = (value: number) => {
    const currentAmount = parseFloat(amount || '0');
    setAmount((currentAmount + value).toString());
  };

  const handleClear = () => {
    setAmount('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit bet with betType, amount, roundId, currency
    console.log('Placing bet:', {
      betType,
      amount,
      currency: selectedCurrency,
      roundId,
    });
    closeBetModal();
  };

  const currentChips = CURRENCIES.find((c) => c.currency === selectedCurrency);

  return (
    <BetModalContext.Provider value={{ openBetModal, closeBetModal }}>
      {children}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              {betType}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <input type="hidden" name="roundId" value={roundId} />

            {/* Currency */}
            <div className="flex gap-2 justify-center">
              {CURRENCIES.map((c) => (
                <button
                  key={c.currency}
                  type="button"
                  onClick={() => setSelectedCurrency(c.currency)}
                  className={cn(
                    'px-3 py-1.5 rounded text-sm font-semibold transition-colors',
                    selectedCurrency === c.currency
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  {c.currency}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                {currentChips?.symbol}
              </span>
              <Input
                type="text"
                placeholder="0"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d.]/g, '');
                  setAmount(val);
                }}
                className="text-2xl font-bold text-center h-14 pl-8"
                required
              />
            </div>

            {/* Chips */}
            <div className="grid grid-cols-3 gap-2">
              {currentChips?.values.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleChipClick(value)}
                  className="py-2.5 rounded bg-secondary hover:bg-secondary/80 font-semibold text-sm transition-colors"
                >
                  {value.toLocaleString()}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="w-full py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeBetModal}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Confirm
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </BetModalContext.Provider>
  );
}
