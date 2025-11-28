import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { LOTTO80_REPOSITORY } from '../../infrastructure/persistence/lotto80-persistence.module';
import { RoundVerificationService } from '../../../../shared/rng';
import { LottoStatus, type ILotto80Repository } from '@ninenine/game-engine';
import { CurrentRoundDto } from '../dto/current-round.dto';

@Controller('lotto80')
export class Lotto80Controller {
  private readonly logger = new Logger(Lotto80Controller.name);
  constructor(
    @Inject(LOTTO80_REPOSITORY) private readonly repo: ILotto80Repository,
    private readonly verification: RoundVerificationService
  ) {}

  /**
   * Verify a round's draw results using its stored seed
   * GET /lotto80/verify/:roundNumber
   */
  @Get('verify/:roundNumber')
  async verifyRound(@Param('roundNumber') roundNumber: string) {
    const round = await this.repo.findById(roundNumber);

    if (!round) {
      throw new NotFoundException(`Round ${roundNumber} not found`);
    }

    if (!round.rngSeed) {
      return {
        success: false,
        message: 'No RNG seed found for this round',
      };
    }

    if (!round.drawnNumbers) {
      return {
        success: false,
        message: 'No drawn numbers found for this round',
      };
    }

    const report = this.verification.generateVerificationReport(
      round.roundNumber.getValue(),
      round.rngSeed,
      round.drawnNumbers.getNumbers(),
      'LOTTO80'
    );

    const verification = this.verification.verifyDrawnNumbers(
      round.rngSeed,
      round.drawnNumbers.getNumbers(),
      20,
      1,
      80
    );

    return {
      success: true,
      verification,
      report,
      round: {
        roundNumber: round.roundNumber.getValue(),
        drawnNumbers: round.drawnNumbers.getNumbers(),
        sum: round.sum,
        overUnder: round.overUnder,
        range: round.range,
        isJackpot: round.isJackpot,
        jackpotOn: round.jackpotOn,
        seed: round.rngSeed,
      },
    };
  }

  @Get('current-round')
  async getCurrentRound(): Promise<CurrentRoundDto | null> {
    this.logger.debug('GET /engine/current-round');

    const round = await this.repo.findCurrentRound();

    if (!round) {
      this.logger.warn('No active round found');
      return null;
    }

    // Return round (entity already has proper serialization)
    // Note: jackpotOnRange is only included when status is FINISHED or SETTLED
    return {
      id: round.id,
      roundNumber: round.roundNumber.getValue(),
      drawnNumbers: round.drawnNumbers ? round.drawnNumbers.getNumbers() : null,
      sum: round.sum,
      ouResult: round.overUnder,
      rangeResult: round.range,
      isJackpot: round.isJackpot,
      jackpotOnRange:
        round.status === LottoStatus.FINISHED ||
        round.status === LottoStatus.SETTLED
          ? round.jackpotOn
          : null,
      status: round.status,
      openedAt: round.openedAt,
      closedAt: round.closedAt,
      drawnAt: round.drawnAt,
      createdAt: round.createdAt,
      updatedAt: round.updatedAt,
    };
  }

  /**
   * GET /engine/previous-round
   *
   * Returns the last SETTLED round for displaying previous results
   * Used to keep number grid active during countdown of next round
   *
   * Response includes complete results:
   * - All drawn numbers
   * - Sum, over/under, range results
   * - Jackpot information if applicable
   */
  @Get('previous-round')
  async getPreviousRound(): Promise<CurrentRoundDto | null> {
    this.logger.debug('GET /engine/previous-round');

    const round = await this.repo.findLatestSettledRound();

    if (!round) {
      this.logger.warn('No previous settled round found');
      return null;
    }

    return {
      id: round.id,
      roundNumber: round.roundNumber.getValue(),
      drawnNumbers: round.drawnNumbers?.getNumbers() || null,
      sum: round.sum,
      ouResult: round.overUnder,
      rangeResult: round.range,
      isJackpot: round.isJackpot,
      jackpotOnRange: round.jackpotOn,
      status: round.status,
      openedAt: round.openedAt,
      closedAt: round.closedAt,
      drawnAt: round.drawnAt,
      createdAt: round.createdAt,
      updatedAt: round.updatedAt,
    };
  }

  @Get('last-settled-rounds')
  async getLastSettledRound(): Promise<
    Pick<CurrentRoundDto, 'id' | 'ouResult' | 'rangeResult'>[] | null
  > {
    this.logger.debug('GET /engine/last-settled-round');

    const rounds = await this.repo.findCompletedRounds(15);

    if (!rounds || rounds.length === 0) {
      this.logger.warn('No settled round found');
      return null;
    }

    return rounds.map((round) => ({
      id: round.id,
      ouResult: round.overUnder,
      rangeResult: round.range,
    }));
  }
}
