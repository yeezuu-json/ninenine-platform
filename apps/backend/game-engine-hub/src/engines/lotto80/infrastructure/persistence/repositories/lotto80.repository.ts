import { Injectable } from '@nestjs/common';
import { Lotto80Entity } from '../entities/lotto80.entity';
import { BaseRepository } from '@ninenine/database';
import {
  ILotto80Repository,
  Lotto80,
  Lotto80Numbers,
  RoundNumber,
  Lotto80OverUnder,
  Lotto80Range,
  LottoStatus,
} from '@ninenine/game-engine';
import { Repository, Not, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class Lotto80Repository
  extends BaseRepository<Lotto80, Lotto80Entity>
  implements ILotto80Repository
{
  constructor(
    @InjectRepository(Lotto80Entity)
    ormRepo: Repository<Lotto80Entity>
  ) {
    super(ormRepo);
  }

  async findCurrentRound(): Promise<Lotto80 | null> {
    const orm = await this.ormRepo.findOne({
      where: {
        status: Not(In([LottoStatus.SETTLED, LottoStatus.VOIDED])),
      },
      order: { createdAt: 'DESC' },
    });
    return orm ? this.mapToDomain(orm) : null;
  }

  async findLatestSettledRound(): Promise<Lotto80 | null> {
    const entity = await this.ormRepo.findOne({
      where: {
        status: LottoStatus.SETTLED,
      },
      order: { createdAt: 'DESC' },
    });
    return entity ? this.mapToDomain(entity) : null;
  }

  async findLatestTodayRound(): Promise<Lotto80 | null> {
    const today = new Date();
    // Use local date, not UTC
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const roundNumberPrefix = `${year}${month}${day}`; // YYYYMMDD

    console.log(
      `[Lotto80 Repo] Looking for rounds with prefix: ${roundNumberPrefix}-`
    );

    const entity = await this.ormRepo
      .createQueryBuilder('round')
      .where('round.round_number LIKE :prefix', {
        prefix: `${roundNumberPrefix}-%`,
      })
      .orderBy('round.created_at', 'DESC')
      .getOne();

    console.log(`[Lotto80 Repo] Found entity:`, entity?.roundNumber);

    return entity ? this.mapToDomain(entity) : null;
  }

  /**
   * Incomplete rounds:
   * OPEN, DRAWING, FINISHED (not settled/voided).
   */
  async findIncompleteRounds(): Promise<Lotto80[]> {
    const ormList = await this.ormRepo.find({
      where: {
        status: In([
          LottoStatus.OPEN,
          LottoStatus.DRAWING,
          LottoStatus.FINISHED,
        ]),
      },
      order: { createdAt: 'ASC' },
    });

    return ormList.map((orm) => this.mapToDomain(orm));
  }

  // Mappers
  protected mapToDomain(entity: Lotto80Entity): Lotto80 {
    return Lotto80.reconstitute({
      id: entity.id,
      roundNumber: new RoundNumber(entity.roundNumber),
      drawnNumbers: entity.drawnNumbers
        ? new Lotto80Numbers(entity.drawnNumbers)
        : null,
      sum: entity.sum,
      drawnAt: entity.drawnAt,
      status: entity.status as LottoStatus,
      overUnder: entity.overUnder as Lotto80OverUnder | null,
      range: entity.range as Lotto80Range | null,
      isJackpot: entity.isJackpot,
      jackpotOn: entity.jackpotOn as Lotto80Range | null,
      closedAt: entity.closedAt,
      openedAt: entity.openedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      rngSeed: entity.rngSeed,
      rngAlgoVersion: entity.rngAlgoVersion,
    });
  }

  protected mapToEntity(domain: Lotto80): Lotto80Entity {
    const entity = new Lotto80Entity();
    entity.id = domain.id;
    entity.roundNumber = domain.roundNumber.getValue();
    entity.status = domain.status;
    entity.openedAt = domain.openedAt;
    entity.closedAt = domain.closedAt;
    entity.drawnNumbers = domain.drawnNumbers?.getNumbers() ?? null;
    entity.drawnAt = domain.drawnAt;
    entity.sum = domain.sum;
    entity.overUnder = domain.overUnder;
    entity.range = domain.range;
    entity.isJackpot = domain.isJackpot;
    entity.jackpotOn = domain.jackpotOn;
    entity.rngSeed = domain.rngSeed;
    entity.rngAlgoVersion = domain.rngAlgoVersion;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
