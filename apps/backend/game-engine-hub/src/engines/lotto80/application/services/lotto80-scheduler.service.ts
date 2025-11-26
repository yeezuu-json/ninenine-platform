// apps/api/game-engine-hub/src/application/schedulers/round-scheduler.service.ts
import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Lotto80Service } from './lotto80.service';

@Injectable()
export class Lotto80SchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(Lotto80SchedulerService.name);

  // Control flags
  private isRunning = true;
  private lotto80Timer: NodeJS.Timeout | null = null;

  // Optional gap between rounds (ms)
  // 0 = immediately start new round after previous finishes
  private readonly BETWEEN_ROUNDS_DELAY = 0;

  constructor(
    private readonly lotto80Service: Lotto80Service // later: // private readonly lotto36Service: Lotto36Service, // private readonly lotto12Service: Lotto12Service,
  ) // private readonly lotto6Service: Lotto6Service,
  {}

  async onModuleInit() {
    this.logger.log('🕒 RoundSchedulerService initialized');

    // Start scheduling for each game you want
    this.scheduleNextLotto80Round();
    // this.scheduleNextLotto36Round();
    // this.scheduleNextLotto12Round();
    // this.scheduleNextLotto6Round();
  }

  async onModuleDestroy() {
    this.logger.log('🛑 RoundSchedulerService shutting down...');
    this.isRunning = false;
    if (this.lotto80Timer) clearTimeout(this.lotto80Timer);
    // clear other timers here when you add more games
  }

  /**
   * Public API to stop all scheduling manually (if you ever need it)
   */
  stopAll() {
    this.logger.warn('⏹️  Stopping all round schedules');
    this.isRunning = false;
    if (this.lotto80Timer) clearTimeout(this.lotto80Timer);
  }

  // ===================== LOTTO80 =====================

  /**
   * Schedule the next Lotto80 round.
   *
   * This does NOT block the Node.js event loop.
   * It just schedules an async callback that:
   *  - runs one full round
   *  - then re-schedules itself
   */
  private scheduleNextLotto80Round() {
    if (!this.isRunning) {
      this.logger.warn(
        '[LOTTO80] Scheduler stopped, not scheduling new rounds'
      );
      return;
    }

    // You can use BETWEEN_ROUNDS_DELAY to leave a gap if you want
    this.lotto80Timer = setTimeout(async () => {
      try {
        this.logger.log('▶️ [LOTTO80] Starting new scheduled round');
        await this.lotto80Service.runOneRound();
        this.logger.log('✅ [LOTTO80] Round completed successfully');
      } catch (err) {
        this.logger.error('❌ [LOTTO80] Error during round execution', err);
        // Optional backoff if you want to avoid tight error loops
        await this.sleep(5000);
      } finally {
        // After the round is finished (success or failure), schedule the next one
        if (this.isRunning) {
          this.logger.log('🔁 [LOTTO80] Scheduling next round');
          this.scheduleNextLotto80Round();
        } else {
          this.logger.warn(
            '[LOTTO80] Scheduler is not running, will not schedule more rounds'
          );
        }
      }
    }, this.BETWEEN_ROUNDS_DELAY);
  }

  // ===================== Helpers =====================

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
