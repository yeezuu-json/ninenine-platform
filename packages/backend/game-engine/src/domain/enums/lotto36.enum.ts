export enum Lotto36OverUnder {
  /** Sum > 111-201 */
  OVER = 'OVER',

  /** Sum ≤ 21-110 */
  UNDER = 'UNDER',
}

export const LOTTO36_OVER_UNDER_THRESHOLD = 111;

export enum Lotto36Range {
  /** Sum: 21-90 */
  RANGE_1 = 'RANGE_1',

  /** Sum: 91-100 */
  RANGE_2 = 'RANGE_2',

  /** Sum: 101-110 */
  RANGE_3 = 'RANGE_3',

  /** Sum: 111-120 */
  RANGE_4 = 'RANGE_4',

  /** Sum: 121-130 */
  RANGE_5 = 'RANGE_5',

  /** Sum: 131-201 */
  RANGE_6 = 'RANGE_6',
}

export enum BettweenRange {
  /** Sum: 91-110 */
  BETWEEN_2_3 = 'BETWEEN_2_3',

  /** Sum: 101-120 */
  BETWEEN_3_4 = 'BETWEEN_3_4',

  /** Sum: 111-130 */
  BETWEEN_4_5 = 'BETWEEN_4_5',
}

export function sumLotto36Range(sum: number): Lotto36Range {
  if (sum >= 21 && sum <= 90) return Lotto36Range.RANGE_1;
  if (sum >= 91 && sum <= 100) return Lotto36Range.RANGE_2;
  if (sum >= 101 && sum <= 110) return Lotto36Range.RANGE_3;
  if (sum >= 111 && sum <= 120) return Lotto36Range.RANGE_4;
  if (sum >= 121 && sum <= 130) return Lotto36Range.RANGE_5;
  if (sum >= 131 && sum <= 201) return Lotto36Range.RANGE_6;

  throw new Error(`Invalid sum: ${sum}. Must be between 21 and 201.`);
}

export function sumLotto36BetweenRange(sum: number): BettweenRange {
  if (sum >= 91 && sum <= 110) return BettweenRange.BETWEEN_2_3;
  if (sum >= 101 && sum <= 120) return BettweenRange.BETWEEN_3_4;
  if (sum >= 111 && sum <= 130) return BettweenRange.BETWEEN_4_5;

  throw new Error(`Invalid sum: ${sum}. Must be between 91 and 130.`);
}
