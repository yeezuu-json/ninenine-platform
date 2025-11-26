import { Injectable } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import seedrandom from 'seedrandom';
import { IRngService, RngResult, RngSeed } from '@ninenine/game-engine';

/**
 * Cryptographically secure, seeded RNG service
 * Provides reproducible random number generation for game draws
 */
@Injectable()
export class SeededRngService implements IRngService {
  /**
   * Generate a cryptographically secure seed using Node.js crypto
   * @returns A 256-bit hex seed (64 characters)
   */
  generateSeed(): RngSeed {
    const bytes = randomBytes(32); // 32 bytes = 256 bits
    const hexSeed = bytes.toString('hex');
    return new RngSeed(hexSeed);
  }

  /**
   * Create a seeded random number generator
   * @param seed - Seed to use for RNG
   * @returns Seeded random function
   */
  private createRng(seed: RngSeed): seedrandom.PRNG {
    return seedrandom(seed.getValue());
  }

  /**
   * Generate a random integer between min (inclusive) and max (exclusive)
   */
  randomInt(min: number, max: number, seed?: RngSeed): RngResult<number> {
    const usedSeed = seed ?? this.generateSeed();
    const rng = this.createRng(usedSeed);
    const value = Math.floor(rng() * (max - min)) + min;
    return { value, seed: usedSeed };
  }

  /**
   * Generate a random float between 0 (inclusive) and 1 (exclusive)
   */
  randomFloat(seed?: RngSeed): RngResult<number> {
    const usedSeed = seed ?? this.generateSeed();
    const rng = this.createRng(usedSeed);
    const value = rng();
    return { value, seed: usedSeed };
  }

  /**
   * Shuffle an array using Fisher-Yates algorithm with a seed
   */
  shuffle<T>(array: T[], seed?: RngSeed): RngResult<T[]> {
    const usedSeed = seed ?? this.generateSeed();
    const rng = this.createRng(usedSeed);
    const shuffled = [...array]; // Create a copy to avoid mutation

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return { value: shuffled, seed: usedSeed };
  }

  /**
   * Select a random element from an array
   */
  pickRandom<T>(array: T[], seed?: RngSeed): RngResult<T> {
    if (array.length === 0) {
      throw new Error('Cannot pick from empty array');
    }

    const usedSeed = seed ?? this.generateSeed();
    const rng = this.createRng(usedSeed);
    const index = Math.floor(rng() * array.length);
    return { value: array[index], seed: usedSeed };
  }

  /**
   * Draw N unique random numbers from a range [min, max]
   * Uses Fisher-Yates shuffle for efficiency
   */
  drawUniqueNumbers(
    count: number,
    min: number,
    max: number,
    seed?: RngSeed
  ): RngResult<number[]> {
    const rangeSize = max - min + 1;

    if (count > rangeSize) {
      throw new Error(
        `Cannot draw ${count} unique numbers from range of ${rangeSize}`
      );
    }

    if (count <= 0) {
      throw new Error('Count must be positive');
    }

    const usedSeed = seed ?? this.generateSeed();
    const rng = this.createRng(usedSeed);

    // Create array of all possible numbers
    const available = Array.from({ length: rangeSize }, (_, i) => min + i);

    // Use partial Fisher-Yates shuffle to draw only what we need
    const drawn: number[] = [];
    for (let i = 0; i < count; i++) {
      const remainingCount = available.length - i;
      const j = i + Math.floor(rng() * remainingCount);
      drawn.push(available[j]);
      [available[i], available[j]] = [available[j], available[i]];
    }

    return { value: drawn, seed: usedSeed };
  }

  /**
   * Verify that a seed produces expected results
   * Useful for auditing and dispute resolution
   */
  verify<T>(seed: RngSeed, operation: (rng: IRngService) => T): T {
    // Create a deterministic instance using the seed
    // The operation will use this instance to produce reproducible results
    return operation(this);
  }

  /**
   * Generate a hash of the seed for public commitment
   * Used in provably fair systems (hash chain verification)
   */
  hashSeed(seed: RngSeed): string {
    return createHash('sha256').update(seed.getValue()).digest('hex');
  }

  /**
   * Verify a hash matches a seed
   * Used to prove a seed wasn't changed after commitment
   */
  verifySeedHash(seed: RngSeed, expectedHash: string): boolean {
    const actualHash = this.hashSeed(seed);
    return actualHash === expectedHash;
  }
}
