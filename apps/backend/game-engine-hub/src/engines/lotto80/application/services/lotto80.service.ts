import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  Lotto80,
  Lotto80Range,
  RoundNumber,
  RngSeed,
  type ILotto80Repository,
  type IRngService,
} from '@ninenine/game-engine';
import { v4 as uuidv4 } from 'uuid';
import { LOTTO80_REPOSITORY } from '../../infrastructure/persistence/lotto80-persistence.module';
import { RNG_SERVICE } from '../../../../shared/rng';
import {
  Lotto80CountdownEvent,
  Lotto80DrawingBallEvent,
  Lotto80DrawingDelayEvent,
  Lotto80DrawingStartedEvent,
  Lotto80RoundFinishedEvent,
  Lotto80RoundOpenedEvent,
  Lotto80RoundSettledEvent,
} from '@ninenine/game-events';
import type { GameEventsPublisher } from '@ninenine/game-events';

@Injectable()
export class Lotto80Service {
  private readonly logger = new Logger(Lotto80Service.name);
  private readonly OPEN_DURATION = 30_000;
  private readonly BALL_DELAY = 2_000;
  private readonly FINISHED_DURATION = 3_000;
  private readonly TOTAL_BALLS = 20;

  private currentRound: Lotto80 | null = null;
  private secretJackpotTarget: Lotto80Range | null = null;

  constructor(
    @Inject(LOTTO80_REPOSITORY) private repo: ILotto80Repository,
    @Inject('GameEventsPublisher') private readonly events: GameEventsPublisher,
    @Inject(RNG_SERVICE) private readonly rng: IRngService
  ) {}

  async runOneRound(): Promise<void> {
    this.logger.log('Running one round of Lotto80...');

    // 1. Incompleted round marked as voided
    await this.markIncompletedRoundsAsVoided();

    // 2. Create new round
    await this.startNewRound();
    await this.runOpenPhase();

    // 3. Drawing numbers and mark round as drawing
    await this.runDrawingPhase();

    // 4. Finished round and mark as finished, calculate results
    await this.runFinishedPhase();

    // 5. Settled rounds
    await this.runSettledPhase();

    // Reset current round and secret jackpot target
    this.currentRound = null;
    this.secretJackpotTarget = null;
  }

  /**
   * If old round is not completed, mark it as voided or server restart in issue occurs
   * @return void
   */
  private async markIncompletedRoundsAsVoided(): Promise<void> {
    try {
      const incompleteRounds = await this.repo.findIncompleteRounds();

      if (incompleteRounds.length === 0) {
        this.logger.log('✅ No incomplete rounds to void');
        return;
      }

      this.logger.warn(
        `⚠️  Found ${incompleteRounds.length} incomplete round(s) - voiding...`
      );

      for (const round of incompleteRounds) {
        round.void();
        await this.repo.save(round);
        const drawnNumbers = round.drawnNumbers?.getNumbers() ?? 'no numbers';
        this.logger.log(
          `🚫 Voided round ${drawnNumbers} (was ${round.status})`
        );
      }

      this.logger.log('✅ All incomplete rounds voided');
    } catch (error) {
      this.logger.error('❌ Failed to void incomplete rounds', error);
      throw error;
    }
  }

  /**
   * Start a new round of Lotto80
   * @return void
   */
  private async startNewRound(): Promise<void> {
    this.logger.log('📝 Creating new round');

    try {
      const latestRound = await this.repo.findLatestTodayRound();
      const sequence = latestRound
        ? latestRound.roundNumber.parse().sequence + 1
        : 1;
      const roundNumber = RoundNumber.generateForToday(sequence);
      const seed = this.rng.generateSeed();
      const jackpotConfig = this.determineJackpot(seed);
      console.log('seed value ', seed.getValue());

      const round = Lotto80.create(
        uuidv4(),
        roundNumber,
        jackpotConfig.isJackpot,
        null,
        seed.getValue(),
        1
      );

      this.currentRound = await this.repo.save(round);

      this.secretJackpotTarget = jackpotConfig.isJackpot
        ? jackpotConfig.jackpotOnRange
        : null;

      this.logger.log(
        `✨ Round created: ${roundNumber.getValue()} | Mystery Jackpot: ${
          jackpotConfig.isJackpot
        }${
          this.secretJackpotTarget
            ? ` [SECRET: ${this.secretJackpotTarget}]`
            : ''
        }`
      );
    } catch (error) {
      this.logger.error('❌ Failed to start a new round', error);
      throw error;
    }
  }

  /**
   * Phase 1: OPEN (30 seconds)
   * Accept bets, emit countdown events every 1 second
   * @returns void
   */
  private async runOpenPhase(): Promise<void> {
    if (!this.currentRound) throw new Error('No current round');

    this.logger.log(
      `🔓 Phase 1: OPEN (30s) - Round ${this.currentRound.roundNumber.getValue()}`
    );

    // broadcast opened
    await this.events.publishRoundOpened(
      new Lotto80RoundOpenedEvent(
        this.currentRound.id,
        this.currentRound.roundNumber.getValue(),
        this.currentRound.status,
        this.OPEN_DURATION / 1000,
        new Date(),
        new Date()
      )
    );

    for (let countdown = 30; countdown >= 1; countdown--) {
      await this.delay(1000);

      await this.events.publishRoundCountdown(
        new Lotto80CountdownEvent(
          this.currentRound.id,
          this.currentRound.roundNumber.getValue(),
          this.currentRound.status,
          countdown,
          new Date()
        )
      );

      this.logger.debug(`⏱️ Countdown: ${countdown}s`);
    }

    this.logger.log('✅ Phase 1 complete');
  }

  /**
   * Phase 2: DRAWING
   * Draw 20 balls with incremental DB updates
   * @returns void
   */
  private async runDrawingPhase(): Promise<void> {
    if (!this.currentRound) throw new Error('No current round');

    this.logger.log(
      `🎲 Phase 2: DRAWING - Round ${this.currentRound.roundNumber.getValue()}`
    );

    this.currentRound.startDrawing();
    await this.repo.save(this.currentRound);

    await this.events.publishDrawingStarted(
      new Lotto80DrawingStartedEvent(
        this.currentRound.id,
        this.currentRound.roundNumber.getValue(),
        this.currentRound.status,
        this.currentRound.isJackpot,
        null,
        new Date()
      )
    );

    if (!this.currentRound.rngSeed) {
      throw new Error('RNG seed not found for current round');
    }

    const seed = new RngSeed(this.currentRound.rngSeed);
    const drawnBalls = this.secretJackpotTarget
      ? this.drawBallsWeighted(this.secretJackpotTarget, seed)
      : this.drawBalls(seed);
    let cumulativeSum = 0;

    for (let position = 1; position <= this.TOTAL_BALLS; position++) {
      await this.events.publishDrawingDelay(
        new Lotto80DrawingDelayEvent(
          this.currentRound.id,
          this.currentRound.roundNumber.getValue(),
          this.currentRound.status,
          this.BALL_DELAY / 1000,
          new Date()
        )
      );

      await this.delay(this.BALL_DELAY);

      const ball = drawnBalls[position - 1];
      cumulativeSum += ball;

      this.currentRound.addBall(ball);
      await this.repo.save(this.currentRound);

      await this.events.publishDrawingBall(
        new Lotto80DrawingBallEvent(
          this.currentRound.id,
          this.currentRound.roundNumber.getValue(),
          this.currentRound.status,
          ball,
          position,
          cumulativeSum,
          new Date()
        )
      );

      this.logger.debug(
        `🎱 Ball ${position}/20: ${ball} | Sum: ${cumulativeSum}`
      );

      await this.delay(this.BALL_DELAY);
    }

    if (this.currentRound.isJackpot && this.secretJackpotTarget) {
      const finalRange = this.currentRound.range;
      if (finalRange) {
        this.currentRound.setJackpotOn(finalRange);
        await this.repo.save(this.currentRound);

        this.logger.log(
          `🎰 Mystery Jackpot Revealed: ${finalRange} (Target was: ${this.secretJackpotTarget})`
        );
      }
    }

    this.logger.log(
      `✅ Phase 2 complete | Sum: ${this.currentRound.sum ?? 'N/A'} | OU: ${
        this.currentRound.overUnder ?? 'N/A'
      } | Range: ${this.currentRound.range ?? 'N/A'}`
    );
  }

  /**
   * Phase 3: FINISHED (3 seconds)
   * Display final results
   * @return void
   */
  private async runFinishedPhase(): Promise<void> {
    if (!this.currentRound) throw new Error('No current round');

    this.logger.log(
      `🏁 Phase 3: FINISHED (3s) - Round ${this.currentRound.roundNumber.getValue()}`
    );

    this.currentRound.finishDrawing();
    await this.repo.save(this.currentRound);

    const jackpotHit = this.currentRound.isJackpotHit();

    const sum = this.currentRound.sum;
    const drawnAt = this.currentRound.drawnAt;
    const overUnder = this.currentRound.overUnder;
    const range = this.currentRound.range;

    if (!sum || !drawnAt || !overUnder || !range) {
      throw new Error('Round data incomplete for finished phase');
    }

    await this.events.publishRoundFinished(
      new Lotto80RoundFinishedEvent(
        this.currentRound.id,
        this.currentRound.roundNumber.getValue(),
        this.currentRound.status,
        this.currentRound.drawnNumbers?.getNumbers() ?? [],
        sum,
        drawnAt,
        overUnder,
        range,
        this.currentRound.isJackpot,
        this.currentRound.jackpotOn,
        jackpotHit,
        new Date()
      )
    );

    if (jackpotHit) {
      this.logger.log('🎉 JACKPOT HIT! 🎉');
    }

    await this.delay(this.FINISHED_DURATION);
    this.logger.log('✅ Phase 3 complete');
  }

  /**
   * Phase 4: SETTLED (instant)
   * Mark payouts complete (future: actual payout distribution)
   * @return void
   */
  private async runSettledPhase(): Promise<void> {
    if (!this.currentRound) throw new Error('No current round');

    this.logger.log(
      `💰 Phase 4: SETTLED - Round ${this.currentRound.roundNumber.getValue()}`
    );

    this.currentRound.settle();
    await this.repo.save(this.currentRound);

    await this.events.publishRoundSettled(
      new Lotto80RoundSettledEvent(
        this.currentRound.id,
        this.currentRound.roundNumber.getValue(),
        this.currentRound.status,
        new Date()
      )
    );

    this.logger.log('✅ Phase 4 complete');
  }

  // Helper functions
  private drawBalls(seed: RngSeed): number[] {
    const result = this.rng.drawUniqueNumbers(this.TOTAL_BALLS, 1, 80, seed);
    return result.value;
  }

  private determineJackpot(seed: RngSeed): {
    isJackpot: boolean;
    jackpotOnRange: Lotto80Range | null;
  } {
    const JACKPOT_PROBABILITY = 1.0; // TODO: move to config
    const randomValue = this.rng.randomFloat(seed);
    const isJackpot = randomValue.value < JACKPOT_PROBABILITY;

    if (!isJackpot) {
      return { isJackpot: false, jackpotOnRange: null };
    }

    const possibleRanges: Lotto80Range[] = [
      Lotto80Range.RANGE_1,
      Lotto80Range.RANGE_2,
      Lotto80Range.RANGE_3,
      Lotto80Range.RANGE_4,
      Lotto80Range.RANGE_5,
    ];

    const rangeResult = this.rng.pickRandom(possibleRanges, seed);

    return { isJackpot, jackpotOnRange: rangeResult.value };
  }

  private drawBallsWeighted(
    targetRange: Lotto80Range,
    seed: RngSeed
  ): number[] {
    // Determine target sum range
    const targetBounds = this.getRangeBounds(targetRange);
    const targetMin = targetBounds.min;
    const targetMax = targetBounds.max;

    // Draw first 15 balls randomly
    const drawnBalls: number[] = [];
    const available = Array.from({ length: 80 }, (_, i) => i + 1);

    for (let i = 0; i < 15; i++) {
      const idxResult = this.rng.randomInt(0, available.length, seed);
      drawnBalls.push(available[idxResult.value]);
      available.splice(idxResult.value, 1);
    }

    // Calculate current sum
    let currentSum = drawnBalls.reduce((a, b) => a + b, 0);

    // Draw last 5 balls with intelligent selection
    for (let i = 15; i < 20; i++) {
      const remaining = 20 - i;

      // Filter available balls that can help reach target
      const validBalls = available.filter((ball) => {
        // Estimate if this ball can help reach target
        const minPossibleSum = currentSum + ball + remaining * 1; // Worst case: all 1s
        const maxPossibleSum = currentSum + ball + remaining * 80; // Best case: all 80s
        return minPossibleSum <= targetMax && maxPossibleSum >= targetMin;
      });

      // Select from valid balls (or all if none valid)
      const candidateBalls = validBalls.length > 0 ? validBalls : available;

      // Prefer balls that move us toward target range
      const optimalBalls = candidateBalls.filter((ball) => {
        const newSum = currentSum + ball;
        const avgRemaining = (1 + 80) / 2; // Average ball value
        const projectedSum = newSum + remaining * avgRemaining;
        return projectedSum >= targetMin && projectedSum <= targetMax;
      });

      const selectFrom =
        optimalBalls.length > 0 ? optimalBalls : candidateBalls;
      const ballResult = this.rng.pickRandom(selectFrom, seed);
      const selectedBall = ballResult.value;

      drawnBalls.push(selectedBall);
      currentSum += selectedBall;
      available.splice(available.indexOf(selectedBall), 1);
    }

    const finalSum = drawnBalls.reduce((a, b) => a + b, 0);
    this.logger.debug(
      `🎯 Weighted draw complete: Sum=${finalSum}, Target=${targetRange} (${targetMin}-${targetMax})`
    );

    return drawnBalls;
  }

  /**
   * Get min/max sum boundaries for a range
   */
  private getRangeBounds(range: Lotto80Range): { min: number; max: number } {
    switch (range) {
      case Lotto80Range.RANGE_1:
        return { min: 210, max: 537 };
      case Lotto80Range.RANGE_2:
        return { min: 538, max: 670 };
      case Lotto80Range.RANGE_3:
        return { min: 671, max: 810 };
      case Lotto80Range.RANGE_4:
        return { min: 811, max: 943 };
      case Lotto80Range.RANGE_5:
        return { min: 944, max: 1410 };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
