import { Injectable, Logger } from '@nestjs/common';
import { SeededRngService } from './seeded-rng.service';
import { RngSeed } from '@ninenine/game-engine';

/**
 * Verification Result
 */
export interface VerificationResult {
  isValid: boolean;
  seed: string;
  expectedNumbers?: number[];
  actualNumbers?: number[];
  message: string;
}

/**
 * Round Verification Service
 * Provides utilities to verify game round draws using stored seeds
 * Critical for auditing and dispute resolution
 */
@Injectable()
export class RoundVerificationService {
  private readonly logger = new Logger(RoundVerificationService.name);

  constructor(private readonly rng: SeededRngService) {}

  /**
   * Verify that a seed produces the expected drawn numbers
   * @param seedValue - The hex seed string
   * @param expectedNumbers - The numbers that were drawn
   * @param count - Number of balls to draw
   * @param min - Minimum ball value
   * @param max - Maximum ball value
   * @returns Verification result with details
   */
  verifyDrawnNumbers(
    seedValue: string,
    expectedNumbers: number[],
    count: number,
    min: number,
    max: number
  ): VerificationResult {
    try {
      const seed = new RngSeed(seedValue);

      // Reproduce the draw using the seed
      const result = this.rng.drawUniqueNumbers(count, min, max, seed);
      const actualNumbers = result.value;

      // Compare the results
      const isValid =
        actualNumbers.length === expectedNumbers.length &&
        actualNumbers.every(
          (num: number, idx: number) => num === expectedNumbers[idx]
        );

      if (isValid) {
        this.logger.log(
          `✅ Seed verification passed for seed: ${seedValue.substring(
            0,
            16
          )}...`
        );
        return {
          isValid: true,
          seed: seedValue,
          expectedNumbers,
          actualNumbers,
          message: 'Draw verification successful. Numbers match exactly.',
        };
      } else {
        this.logger.warn(
          `❌ Seed verification FAILED for seed: ${seedValue.substring(
            0,
            16
          )}...`
        );
        return {
          isValid: false,
          seed: seedValue,
          expectedNumbers,
          actualNumbers,
          message: `Draw verification failed. Expected ${expectedNumbers.join(
            ','
          )} but got ${actualNumbers.join(',')}`,
        };
      }
    } catch (error) {
      this.logger.error('Error during verification', error);
      return {
        isValid: false,
        seed: seedValue,
        message: `Verification error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      };
    }
  }

  /**
   * Verify a hash commitment matches a seed
   * Used in provably fair systems
   * @param seedValue - The revealed seed
   * @param expectedHash - The hash that was committed
   * @returns True if hash matches
   */
  verifySeedHash(seedValue: string, expectedHash: string): boolean {
    try {
      const seed = new RngSeed(seedValue);
      // Assuming the RNG service has a hashSeed method
      // We'll need to add this to the interface or use crypto directly
      const crypto = require('crypto');
      const actualHash = crypto
        .createHash('sha256')
        .update(seed.getValue())
        .digest('hex');

      return actualHash === expectedHash;
    } catch (error) {
      this.logger.error('Error verifying seed hash', error);
      return false;
    }
  }

  /**
   * Generate a public report for a round verification
   * @param roundNumber - Round identifier
   * @param seedValue - The seed used
   * @param drawnNumbers - The numbers that were drawn
   * @param gameType - Type of game (LOTTO80, LOTTO36, etc.)
   * @returns Human-readable verification report
   */
  generateVerificationReport(
    roundNumber: string,
    seedValue: string,
    drawnNumbers: number[],
    gameType: 'LOTTO80' | 'LOTTO36' | 'LOTTO12' | 'LOTTO6'
  ): string {
    const config = this.getGameConfig(gameType);
    const verification = this.verifyDrawnNumbers(
      seedValue,
      drawnNumbers,
      config.count,
      config.min,
      config.max
    );

    const report = [
      '═══════════════════════════════════════════════════════════',
      `               ROUND VERIFICATION REPORT`,
      '═══════════════════════════════════════════════════════════',
      `Game Type:     ${gameType}`,
      `Round Number:  ${roundNumber}`,
      `RNG Seed:      ${seedValue.substring(0, 32)}...`,
      `───────────────────────────────────────────────────────────`,
      `Verification:  ${verification.isValid ? '✅ PASSED' : '❌ FAILED'}`,
      `Message:       ${verification.message}`,
      `───────────────────────────────────────────────────────────`,
      `Expected:      [${drawnNumbers.join(', ')}]`,
      `Reproduced:    [${verification.actualNumbers?.join(', ') ?? 'N/A'}]`,
      '═══════════════════════════════════════════════════════════',
    ].join('\n');

    return report;
  }

  /**
   * Get game configuration for verification
   */
  private getGameConfig(
    gameType: 'LOTTO80' | 'LOTTO36' | 'LOTTO12' | 'LOTTO6'
  ): { count: number; min: number; max: number } {
    switch (gameType) {
      case 'LOTTO80':
        return { count: 20, min: 1, max: 80 };
      case 'LOTTO36':
        return { count: 12, min: 1, max: 36 };
      case 'LOTTO12':
        return { count: 6, min: 1, max: 12 };
      case 'LOTTO6':
        return { count: 3, min: 1, max: 6 };
      default:
        throw new Error(`Unknown game type: ${gameType}`);
    }
  }
}
