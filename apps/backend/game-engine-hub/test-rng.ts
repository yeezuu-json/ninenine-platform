// Quick test to verify RNG randomness
import seedrandom from 'seedrandom';
import { randomBytes } from 'crypto';

function testRNG() {
  // Test 1: Same seed should produce same results
  const seed1 = randomBytes(32).toString('hex');
  const rng1a = seedrandom(seed1);
  const rng1b = seedrandom(seed1);

  const result1a = [];
  const result1b = [];

  for (let i = 0; i < 20; i++) {
    result1a.push(Math.floor(rng1a() * 80) + 1);
    result1b.push(Math.floor(rng1b() * 80) + 1);
  }

  console.log('Same seed test:');
  console.log('Result A:', result1a);
  console.log('Result B:', result1b);
  console.log('Match:', JSON.stringify(result1a) === JSON.stringify(result1b));

  // Test 2: Different seeds should produce different results
  const seed2 = randomBytes(32).toString('hex');
  const seed3 = randomBytes(32).toString('hex');

  console.log('\nDifferent seeds:');
  console.log('Seed 2:', seed2.substring(0, 16) + '...');
  console.log('Seed 3:', seed3.substring(0, 16) + '...');

  const rng2 = seedrandom(seed2);
  const rng3 = seedrandom(seed3);

  const result2 = [];
  const result3 = [];

  for (let i = 0; i < 20; i++) {
    result2.push(Math.floor(rng2() * 80) + 1);
    result3.push(Math.floor(rng3() * 80) + 1);
  }

  console.log('Result 2:', result2);
  console.log('Result 3:', result3);
  console.log(
    'Different:',
    JSON.stringify(result2) !== JSON.stringify(result3)
  );

  // Test 3: Fisher-Yates shuffle
  function fisherYates(seed: string) {
    const rng = seedrandom(seed);
    const available = Array.from({ length: 80 }, (_, i) => i + 1);
    const drawn: number[] = [];

    for (let i = 0; i < 20; i++) {
      const remainingCount = available.length - i;
      const j = i + Math.floor(rng() * remainingCount);
      drawn.push(available[j]);
      [available[i], available[j]] = [available[j], available[i]];
    }

    return drawn;
  }

  console.log('\nFisher-Yates tests:');
  const seed4 = randomBytes(32).toString('hex');
  const seed5 = randomBytes(32).toString('hex');
  const seed6 = randomBytes(32).toString('hex');

  console.log('Draw 1:', fisherYates(seed4));
  console.log('Draw 2:', fisherYates(seed5));
  console.log('Draw 3:', fisherYates(seed6));
}

testRNG();
