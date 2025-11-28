import { useRoadmap } from '../../hooks/use-roadmap';
import { RoundResult } from '../../services';

const ROWS = 6;
const MAX_COLS = 15;

export default function RangeMap() {
  const { results, loading, error } = useRoadmap();

  // Build the roadmap grid
  const buildRoadmap = () => {
    const grid: (RoundResult | null)[][] = Array(ROWS)
      .fill(null)
      .map(() => Array(MAX_COLS).fill(null));

    if (results.length === 0) return grid;

    let currentCol = 0;
    let currentRow = 0;
    let previousResult: string | null = null;

    // Process results from oldest to newest (reverse if API returns newest first)
    const orderedResults = [...results].reverse();

    orderedResults.forEach((result) => {
      // First result
      if (previousResult === null) {
        grid[currentRow][currentCol] = result;
        previousResult = result.rangeResult;
        return;
      }

      // Same result (streak) - move down
      if (result.rangeResult === previousResult) {
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
      previousResult = result.rangeResult;
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

  // Get range number from RANGE_1, RANGE_2, etc.
  const getRangeNumber = (rangeResult: string): string => {
    return rangeResult.replace('RANGE_', '');
  };

  // Get color for each range
  const getRangeColor = (rangeResult: string): string => {
    switch (rangeResult) {
      case 'RANGE_1':
        return 'bg-purple-500';
      case 'RANGE_2':
        return 'bg-blue-500';
      case 'RANGE_3':
        return 'bg-green-500';
      case 'RANGE_4':
        return 'bg-orange-500';
      case 'RANGE_5':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="w-full h-full">
      <table className="w-full">
        <tbody>
          {roadmap.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => {
                const isEmpty = cell === null;

                return (
                  <td
                    key={colIndex}
                    className="border border-operator-border text-center align-middle text-xs font-bold p-0 bg-operator-surface"
                  >
                    {isEmpty ? (
                      <div className="size-10 aspect-square w-full" />
                    ) : (
                      <div className="size-10 aspect-square w-full flex items-center justify-center">
                        <div
                          className={`size-8 rounded-full flex items-center justify-center text-lg text-white font-bold ${getRangeColor(
                            cell.rangeResult
                          )}`}
                        >
                          {getRangeNumber(cell.rangeResult)}
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
