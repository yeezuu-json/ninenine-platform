export class Lotto80Numbers {
  private readonly numbers: number[];

  constructor(numbers: number[]) {
    this.validate(numbers);
    this.numbers = [...numbers]; // Immutable copy
  }

  private validate(numbers: number[]): void {
    // Check length (0-20 for incremental drawing)
    if (numbers.length > 20) {
      throw new Error(
        `Cannot have more than 20 drawn numbers. Got: ${numbers.length}`
      );
    }

    // Check all numbers are in valid range (1-80)
    const invalidNumbers = numbers.filter((n) => n < 1 || n > 80);
    if (invalidNumbers.length > 0) {
      throw new Error(
        `Numbers must be between 1-80. Invalid: ${invalidNumbers.join(', ')}`
      );
    }

    // Check for duplicates
    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== numbers.length) {
      throw new Error('Drawn numbers must be unique');
    }
  }

  getNumbers(): number[] {
    return [...this.numbers]; // Return immutable copy
  }

  getCount(): number {
    return this.numbers.length;
  }

  isComplete(): boolean {
    return this.numbers.length === 20;
  }

  /**
   * Calculate sum of all drawn numbers
   */
  calculateSum(): number {
    return this.numbers.reduce((sum, num) => sum + num, 0);
  }

  /**
   * Add a new ball to the drawn numbers
   * Returns a new DrawnNumbers instance (immutable)
   */
  addBall(ball: number): Lotto80Numbers {
    return new Lotto80Numbers([...this.numbers, ball]);
  }

  /**
   * Check if a number has been drawn
   */
  includes(number: number): boolean {
    return this.numbers.includes(number);
  }

  equals(other: Lotto80Numbers): boolean {
    if (this.numbers.length !== other.numbers.length) {
      return false;
    }
    return this.numbers.every((num, index) => num === other.numbers[index]);
  }
}
