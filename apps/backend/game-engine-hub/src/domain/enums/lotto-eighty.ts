export enum LottoEightyStatus {
  OPEN = 'OPEN',
  DRAWING = 'DRAWING',
  FINISHED = 'FINISHED',
  SETTLED = 'SETTLED',
  VOIDED = 'VOIDED',
}

export enum OverUnder {
  /** Sum > 810 */
  OVER = 'OVER',

  /** Sum ≤ 810 */
  UNDER = 'UNDER',
}

export const OVER_UNDER_THRESHOLD = 810;

export enum Range {
  /** Sum: 210-695 */
  RANGE_1 = 'RANGE_1',

  /** Sum: 696-763 */
  RANGE_2 = 'RANGE_2',

  /** Sum: 764-856 */
  RANGE_3 = 'RANGE_3',

  /** Sum: 857-923 */
  RANGE_4 = 'RANGE_4',

  /** Sum: 924-1410 */
  RANGE_5 = 'RANGE_5',
}

/**
 * Calculate range result from sum
 */
export function calculateRangeFromSum(sum: number): Range {
  if (sum >= 210 && sum <= 695) return Range.RANGE_1;
  if (sum >= 696 && sum <= 763) return Range.RANGE_2;
  if (sum >= 764 && sum <= 856) return Range.RANGE_3;
  if (sum >= 857 && sum <= 923) return Range.RANGE_4;
  if (sum >= 924 && sum <= 1410) return Range.RANGE_5;

  throw new Error(`Invalid sum: ${sum}. Must be between 210 and 1410.`);
}
