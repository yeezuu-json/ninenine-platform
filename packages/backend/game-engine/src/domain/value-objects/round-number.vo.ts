/**
 * Value object representing a unique round number identifier.
 *
 * @remarks
 * The round number follows the format `YYYYMMDD-NNN`, where:
 * - `YYYYMMDD` represents the date (year, month, day)
 * - `NNN` is a 3-digit sequence number (001-999) for rounds within that day
 *
 * @example
 * ```typescript
 * // Create a round number for today with sequence 1
 * const roundNumber = RoundNumber.generateForToday(1);
 *
 * // Create from existing value
 * const existingRound = new RoundNumber('20240315-001');
 *
 * // Parse round number
 * const { date, sequence } = roundNumber.parse();
 * ```
 */
export class RoundNumber {
  private readonly value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error(
        `Invalid round number format: ${value}. Expected format: YYYYMMDD-NNN`
      );
    }
    this.value = value;
  }

  private isValid(value: string): boolean {
    // Format: YYYYMMDD-NNN
    const pattern = /^\d{8}-\d{3}$/;
    return pattern.test(value);
  }

  getValue(): string {
    return this.value;
  }

  /**
   * Generate round number for today
   * @param sequence - Round sequence number for the day (1-999)
   */
  static generateForToday(sequence: number): RoundNumber {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const seq = String(sequence).padStart(3, '0');

    return new RoundNumber(`${year}${month}${day}-${seq}`);
  }

  /**
   * Parse round number to extract date and sequence
   */
  parse(): { date: string; sequence: number } {
    const [datePart, seqPart] = this.value.split('-');
    return {
      date: datePart,
      sequence: parseInt(seqPart, 10),
    };
  }

  equals(other: RoundNumber): boolean {
    return this.value === other.value;
  }
}
