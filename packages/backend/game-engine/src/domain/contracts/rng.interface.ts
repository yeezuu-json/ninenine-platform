import { RngSeed } from '../value-objects/rng-seed.vo';

/**
 * Result of a random number generation operation
 * Contains both the generated value and the seed used for reproducibility
 */
export interface RngResult<T> {
  value: T;
  seed: RngSeed;
}

/**
 * RNG Service Interface
 * Provides cryptographically secure, reproducible random number generation
 */
export interface IRngService {
  /**
   * Generate a new cryptographic seed
   * @returns A cryptographically secure seed
   */
  generateSeed(): RngSeed;

  /**
   * Generate a random integer between min (inclusive) and max (exclusive)
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (exclusive)
   * @param seed - Optional seed for reproducibility. If not provided, generates new seed.
   * @returns Random integer and the seed used
   */
  randomInt(min: number, max: number, seed?: RngSeed): RngResult<number>;

  /**
   * Generate a random float between 0 (inclusive) and 1 (exclusive)
   * @param seed - Optional seed for reproducibility. If not provided, generates new seed.
   * @returns Random float and the seed used
   */
  randomFloat(seed?: RngSeed): RngResult<number>;

  /**
   * Shuffle an array using Fisher-Yates algorithm with a seed
   * @param array - Array to shuffle
   * @param seed - Seed for reproducibility
   * @returns Shuffled array and the seed used
   */
  shuffle<T>(array: T[], seed?: RngSeed): RngResult<T[]>;

  /**
   * Select a random element from an array
   * @param array - Array to select from
   * @param seed - Optional seed for reproducibility. If not provided, generates new seed.
   * @returns Random element and the seed used
   */
  pickRandom<T>(array: T[], seed?: RngSeed): RngResult<T>;

  /**
   * Draw N unique random numbers from a range [min, max]
   * @param count - Number of items to draw
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   * @param seed - Seed for reproducibility
   * @returns Array of unique random numbers and the seed used
   */
  drawUniqueNumbers(
    count: number,
    min: number,
    max: number,
    seed?: RngSeed
  ): RngResult<number[]>;

  /**
   * Verify that a seed produces expected results
   * @param seed - Seed to verify
   * @param operation - Operation to perform (callback function)
   * @returns True if the operation produces consistent results
   */
  verify<T>(seed: RngSeed, operation: (rng: IRngService) => T): T;
}
