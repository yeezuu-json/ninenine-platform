export class Lotto36Numbers {
  private readonly numbers: number[];

  constructor(numbers: number[]) {
    this.validate(numbers);
    this.numbers = [...numbers]; // Immutable copy
  }

  private validate(numbers: number[]): void {
    // Check length (0-6 for incremental drawing)
    if (numbers.length > 6) {
      throw new Error(
        `Cannot have more than 6 drawn numbers. Got: ${numbers.length}`
      );
    }

    // Check all numbers are in valid range (1-36)
    const invalidNumbers = numbers.filter((n) => n < 1 || n > 36);
    if (invalidNumbers.length > 0) {
      throw new Error(
        `Numbers must be between 1-36. Invalid: ${invalidNumbers.join(', ')}`
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
    return this.numbers.length === 6;
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
  addBall(ball: number): Lotto36Numbers {
    return new Lotto36Numbers([...this.numbers, ball]);
  }

  /**
   * Check if a number has been drawn
   */
  includes(number: number): boolean {
    return this.numbers.includes(number);
  }

  equals(other: Lotto36Numbers): boolean {
    if (this.numbers.length !== other.numbers.length) {
      return false;
    }
    return this.numbers.every((num, index) => num === other.numbers[index]);
  }
}
