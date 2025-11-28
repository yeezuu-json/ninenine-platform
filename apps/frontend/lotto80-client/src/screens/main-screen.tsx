import GamePlay from '../components/game-play';

import GameHeader from '../components/features/game-header';
import { useSearchParams } from 'react-router';
import OverUnderMap from '../components/features/over-under-map';
import RangeMap from '../components/features/range-map';

export default function MainScreen() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  return (
    <div className="w-screen min-h-svh flex flex-col bg-operator-background">
      <GameHeader />
      <main className="p-2 space-y-2 overflow-x-auto">
        <div className="max-w-7xl lg:min-w-0 w-full flex lg:max-h-[calc(25rem-7px)] gap-2">
          <div className="w-1/2 min-w-[712px]">
            <GamePlay />
          </div>

          {/* Side Panel - Hidden on mobile, shown beside on desktop */}
          <div className="hidden lg:block lg:min-w-[712px] lg:max-h-[395px]">
            <div className="w-full h-full border border-operator-border bg-operator-surface p-4 flex flex-col justify-between">
              <div className="mx-auto">
                <img
                  src="/assets/logo/main-logo.png"
                  alt="Logo"
                  className="object-contain size-64"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <h2 className="text-xl font-bold text-operator-primary">
                  Welcome, Player!
                </h2>
                <p className="text-operator-text text-sm">
                  Username: token is{' '}
                  {token ? (
                    <span className="font-mono font-semibold">{token}</span>
                  ) : null}
                  <span className="font-mono font-semibold">TABABABA000</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Also responsive */}
        <div className="max-w-7xl lg:min-w-0 w-full flex flex-col lg:flex-row gap-2">
          <div className="w-1/2 min-w-[712px] h-[250px] border border-operator-border bg-operator-surface p-2 flex flex-col">
            <div className="text-xs font-semibold text-operator-text mb-2">
              OVER/UNDER ROADMAP
            </div>
            <div className="flex-1 overflow-hidden">
              <OverUnderMap />
            </div>
          </div>
          <div className="w-1/2 min-w-[712px] h-[250px] border border-operator-border bg-operator-surface p-2 flex flex-col">
            <div className="text-xs font-semibold text-operator-text mb-2">
              RANGE ROADMAP
            </div>
            <div className="flex-1 overflow-hidden">
              <RangeMap />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
