import { createContext } from "react";

export interface BetModalContextType {
  openBetModal: (betType: string, roundId: string) => void;
  closeBetModal: () => void;
}

export const BetModalContext = createContext<BetModalContextType | undefined>(
  undefined
);
