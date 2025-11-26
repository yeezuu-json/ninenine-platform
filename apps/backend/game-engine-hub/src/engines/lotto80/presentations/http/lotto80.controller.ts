import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { LOTTO80_REPOSITORY } from '../../infrastructure/persistence/lotto80-persistence.module';
import { RoundVerificationService } from '../../../../shared/rng';
import type { ILotto80Repository } from '@ninenine/game-engine';

@Controller('lotto80')
export class Lotto80Controller {
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
}
