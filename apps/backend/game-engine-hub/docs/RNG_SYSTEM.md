# RNG System Documentation

## Overview

The RNG (Random Number Generation) system provides **cryptographically secure, reproducible random number generation** for all game draws in the platform. This system is critical for:

- **Provable Fairness**: Players can verify that draw results weren't manipulated
- **Audit Trail**: Every draw can be reproduced using its stored seed
- **Regulatory Compliance**: Gaming authorities require auditable RNG systems
- **Dispute Resolution**: Verify any disputed draw results

## Architecture

### Components

1. **RngSeed Value Object** (`packages/backend/game-engine/src/domain/value-objects/rng-seed.vo.ts`)

   - Encapsulates a 256-bit cryptographic seed
   - Validates hex format and minimum length
   - Immutable

2. **IRngService Interface** (`packages/backend/game-engine/src/domain/contracts/rng.interface.ts`)

   - Domain contract for RNG operations
   - Defines all random number generation methods
   - Returns `RngResult<T>` containing both value and seed

3. **SeededRngService** (`apps/backend/game-engine-hub/src/shared/rng/seeded-rng.service.ts`)

   - Concrete implementation using `seedrandom` library
   - Generates cryptographic seeds using Node.js `crypto.randomBytes()`
   - Provides reproducible RNG using seeds

4. **RoundVerificationService** (`apps/backend/game-engine-hub/src/shared/rng/round-verification.service.ts`)
   - Verifies draw results using stored seeds
   - Generates human-readable verification reports
   - Supports hash commitment verification

## How It Works

### 1. Seed Generation

When a new round starts:

```typescript
const seed = this.rng.generateSeed();
// Generates a 256-bit hex seed: "a3f7b9c2d4e8f1..."
```

The seed is:

- Generated using `crypto.randomBytes(32)` (cryptographically secure)
- 64 hexadecimal characters (32 bytes = 256 bits)
- Stored in the database with the round

### 2. Drawing Numbers

```typescript
// Draw 20 unique numbers from 1-80
const result = this.rng.drawUniqueNumbers(20, 1, 80, seed);
const drawnNumbers = result.value; // [15, 42, 7, 63, ...]
```

The same seed will **always** produce the same sequence of numbers.

### 3. Storage

```typescript
const round = Lotto80.create(
  uuidv4(),
  roundNumber,
  isJackpot,
  jackpotOn,
  seed.getValue() // Store seed in database
);
```

### 4. Verification

Later, anyone can verify the draw:

```typescript
const verification = verificationService.verifyDrawnNumbers(
  storedSeed,
  [15, 42, 7, 63, ...],
  20, 1, 80
);
// Returns: { isValid: true, message: "Numbers match exactly" }
```

## API Usage

### Generate Cryptographic Seed

```typescript
const seed = rngService.generateSeed();
console.log(seed.getValue());
// "a3f7b9c2d4e8f1c3b5a9d7e2f4c8b1a6..."
```

### Random Integer

```typescript
const result = rngService.randomInt(1, 100, seed);
console.log(result.value); // 42
console.log(result.seed.getValue()); // "a3f7..."
```

### Draw Unique Numbers

```typescript
// Lotto80: Draw 20 unique numbers from 1-80
const result = rngService.drawUniqueNumbers(20, 1, 80, seed);
console.log(result.value);
// [15, 42, 7, 63, 28, 51, 9, 77, 34, 12, 55, 23, 68, 41, 3, 58, 19, 73, 30, 46]
```

### Pick Random from Array

```typescript
const ranges = ['RANGE_1', 'RANGE_2', 'RANGE_3', 'RANGE_4', 'RANGE_5'];
const result = rngService.pickRandom(ranges, seed);
console.log(result.value); // "RANGE_3"
```

### Shuffle Array

```typescript
const deck = [1, 2, 3, 4, 5];
const result = rngService.shuffle(deck, seed);
console.log(result.value); // [3, 1, 5, 2, 4]
```

## Game Integration

### Lotto80 Example

```typescript
@Injectable()
export class Lotto80Service {
  constructor(@Inject(RNG_SERVICE) private readonly rng: IRngService) {}

  private async startNewRound(): Promise<void> {
    // 1. Generate seed
    const seed = this.rng.generateSeed();

    // 2. Determine jackpot using seed
    const jackpotConfig = this.determineJackpot(seed);

    // 3. Create round with seed
    const round = Lotto80.create(
      uuidv4(),
      roundNumber,
      jackpotConfig.isJackpot,
      jackpotConfig.jackpotOn,
      seed.getValue() // Stored in DB
    );

    await this.repo.save(round);
  }

  private async runDrawingPhase(): Promise<void> {
    // Retrieve seed from current round
    const seed = new RngSeed(this.currentRound.rngSeed);

    // Draw balls using seed
    const drawnBalls = this.drawBalls(seed);

    // Add each ball incrementally
    for (const ball of drawnBalls) {
      this.currentRound.addBall(ball);
      await this.repo.save(this.currentRound);
      await this.delay(2000);
    }
  }

  private drawBalls(seed: RngSeed): number[] {
    const result = this.rng.drawUniqueNumbers(20, 1, 80, seed);
    return result.value;
  }
}
```

## Verification Endpoint

### HTTP API

```
GET /lotto80/verify/:roundNumber
```

**Example Response:**

```json
{
  "success": true,
  "verification": {
    "isValid": true,
    "seed": "a3f7b9c2d4e8f1c3b5a9d7e2f4c8b1a6...",
    "expectedNumbers": [15, 42, 7, 63, 28, ...],
    "actualNumbers": [15, 42, 7, 63, 28, ...],
    "message": "Draw verification successful. Numbers match exactly."
  },
  "report": "═══════════════════════════════════════...",
  "round": {
    "roundNumber": "20251126-001",
    "drawnNumbers": [15, 42, 7, 63, 28, ...],
    "sum": 810,
    "overUnder": "OVER",
    "range": "RANGE_3",
    "isJackpot": true,
    "jackpotOn": "RANGE_3",
    "seed": "a3f7b9c2d4e8f1c3b5a9d7e2f4c8b1a6..."
  }
}
```

## Provably Fair System

### Hash Commitment (Optional Enhancement)

For maximum transparency:

1. **Before Draw**: Publish hash of seed

   ```typescript
   const hash = rngService.hashSeed(seed);
   // Publish: "7f3d8e9a2b4c1f5e..."
   ```

2. **After Draw**: Reveal seed

   ```typescript
   // Players can verify: hash(seed) === published_hash
   const isValid = verificationService.verifySeedHash(seed, publishedHash);
   ```

3. **Verification**: Reproduce draw
   ```typescript
   // Anyone can verify numbers using revealed seed
   const result = rngService.drawUniqueNumbers(20, 1, 80, seed);
   ```

## Game-Specific Configuration

| Game        | Balls | Range | Config                               |
| ----------- | ----- | ----- | ------------------------------------ |
| **Lotto80** | 20    | 1-80  | `drawUniqueNumbers(20, 1, 80, seed)` |
| **Lotto36** | 12    | 1-36  | `drawUniqueNumbers(12, 1, 36, seed)` |
| **Lotto12** | 6     | 1-12  | `drawUniqueNumbers(6, 1, 12, seed)`  |
| **Lotto6**  | 3     | 1-6   | `drawUniqueNumbers(3, 1, 6, seed)`   |

## Security Considerations

### ✅ Good Practices

- Seeds are generated using `crypto.randomBytes()` (CSPRNG)
- Minimum 256-bit entropy for seeds
- Seeds are stored in database for audit trail
- Verification endpoint allows public auditing
- Same seed always produces same results

### ⚠️ Important Notes

- **Never reuse seeds** across different rounds
- **Store seeds permanently** - required for auditing
- **Protect seed generation** - must use cryptographic RNG
- **Publicly disclose** verification method

### 🔒 Potential Enhancements

1. **Server Seed + Client Seed**: Combine server and client seeds for provably fair
2. **Hash Chain**: Pre-commit hashes before draws
3. **Third-party Verification**: Allow external auditors
4. **Timestamping**: Use blockchain timestamping for seed commits

## Testing

### Unit Test Example

```typescript
describe('SeededRngService', () => {
  it('should produce same numbers with same seed', () => {
    const rng = new SeededRngService();
    const seed = new RngSeed('a'.repeat(64));

    const result1 = rng.drawUniqueNumbers(20, 1, 80, seed);
    const result2 = rng.drawUniqueNumbers(20, 1, 80, seed);

    expect(result1.value).toEqual(result2.value);
  });

  it('should produce different numbers with different seeds', () => {
    const rng = new SeededRngService();
    const seed1 = new RngSeed('a'.repeat(64));
    const seed2 = new RngSeed('b'.repeat(64));

    const result1 = rng.drawUniqueNumbers(20, 1, 80, seed1);
    const result2 = rng.drawUniqueNumbers(20, 1, 80, seed2);

    expect(result1.value).not.toEqual(result2.value);
  });
});
```

## Migration from Math.random()

### Before (Non-reproducible)

```typescript
private drawBalls(): number[] {
  const available = Array.from({ length: 80 }, (_, i) => i + 1);
  const drawn: number[] = [];

  for (let i = 0; i < 20; i++) {
    const idx = Math.floor(Math.random() * available.length);
    drawn.push(available.splice(idx, 1)[0]);
  }

  return drawn;
}
```

### After (Reproducible with RNG Service)

```typescript
private drawBalls(seed: RngSeed): number[] {
  const result = this.rng.drawUniqueNumbers(20, 1, 80, seed);
  return result.value;
}
```

## Troubleshooting

### Issue: "RNG seed cannot be empty"

**Solution**: Ensure seed is generated before creating round

### Issue: "RNG seed must be at least 64 characters"

**Solution**: Use `rngService.generateSeed()` - never create seeds manually

### Issue: "Verification failed - numbers don't match"

**Possible causes**:

1. Seed was modified after draw
2. Different RNG algorithm version
3. Database corruption

### Issue: "Cannot find RNG_SERVICE"

**Solution**: Import `RngModule` in your feature module

## References

- [Seedrandom Library](https://www.npmjs.com/package/seedrandom)
- [Provably Fair Gaming](https://en.bitcoin.it/wiki/Provably_Fair)
- [NIST Random Number Generation](https://csrc.nist.gov/projects/random-bit-generation)
- [Cryptographic Best Practices](https://www.iacr.org/publications/)

## Support

For questions or issues:

- Check verification endpoint: `/lotto80/verify/:roundNumber`
- Review audit logs in database
- Contact development team with round number and seed
