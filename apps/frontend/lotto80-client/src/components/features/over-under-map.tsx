import { useRoadmap } from '../../hooks/use-roadmap';
import { RoundResult } from '../../services';

const ROWS = 6;
const MAX_COLS = 15;

export default function OverUnderMap() {
  const { results, loading, error } = useRoadmap();
  // Build the roadmap grid
  const buildRoadmap = () => {
    const grid: (RoundResult | null)[][] = Array(ROWS)
      .fill(null)
      .map(() => Array(MAX_COLS).fill(null));

    if (results.length === 0) return grid;

    let currentCol = 0;
    let currentRow = 0;
    let previousResult: 'OVER' | 'UNDER' | null = null;

    // Process results from oldest to newest (reverse if API returns newest first)
    const orderedResults = [...results].reverse();

    orderedResults.forEach((result) => {
      // First result
      if (previousResult === null) {
        grid[currentRow][currentCol] = result;
        previousResult = result.ouResult;
        return;
      }

      // Same result (streak) - move down
      if (result.ouResult === previousResult) {
        currentRow++;

        // If we hit bottom, move right and continue from bottom
        if (currentRow >= ROWS) {
          currentCol++;
          currentRow = ROWS - 1;

          // Check if we exceed max columns
          if (currentCol >= MAX_COLS) {
            currentCol = MAX_COLS - 1;
          }
        }
      }
      // Different result (change) - move right and start from top
      else {
        currentCol++;
        currentRow = 0;

        // Check if we exceed max columns
        if (currentCol >= MAX_COLS) {
          currentCol = MAX_COLS - 1;
        }
      }

      grid[currentRow][currentCol] = result;
      previousResult = result.ouResult;
    });

    return grid;
  };

  const roadmap = buildRoadmap();

  if (loading) {
    return (
      <div className="w-full p-4 text-center text-sm text-operator-text">
        Loading roadmap...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 text-center text-sm text-red-500">{error}</div>
    );
  }

  return (
    <div className="w-full h-full">
      <table className="w-full">
        <tbody>
          {roadmap.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => {
                const isEmpty = cell === null;
                const isOver = cell?.ouResult === 'OVER';

                return (
                  <td
                    key={colIndex}
                    className={`border border-operator-border text-center align-middle text-xs font-bold p-0 ${
                      isEmpty
                        ? 'bg-operator-surface'
                        : isOver
                        ? 'text-red-500'
                        : 'text-blue-500'
                    }`}
                  >
                    {isEmpty ? (
                      <div className="size-10 aspect-square w-full" />
                    ) : (
                      <div className="size-10 aspect-square w-full flex items-center justify-center">
                        <div
                          className={`size-8 rounded-full flex items-center justify-center text-lg text-white font-bold ${
                            isOver ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                        >
                          {isOver ? 'O' : 'U'}
                        </div>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
