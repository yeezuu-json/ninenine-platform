/**
 * RNG Seed Value Object
 * Represents a cryptographically generated seed for random number generation
 */
export class RngSeed {
  private readonly value: string;

  constructor(seed: string) {
    this.validate(seed);
    this.value = seed;
  }

  private validate(seed: string): void {
    if (!seed || seed.trim().length === 0) {
      throw new Error('RNG seed cannot be empty');
    }

    // Minimum length for cryptographic security (64 hex chars = 32 bytes = 256 bits)
    if (seed.length < 64) {
      throw new Error(
        'RNG seed must be at least 64 characters for cryptographic security'
      );
    }

    // Validate hex format
    if (!/^[0-9a-f]+$/i.test(seed)) {
      throw new Error('RNG seed must be a valid hexadecimal string');
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: RngSeed): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
