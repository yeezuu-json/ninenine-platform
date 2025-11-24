import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsOrder,
  FindOptionsWhere,
  In,
  Not,
  Repository,
} from 'typeorm';
import { BaseRepository } from '@ninenine/database';
import { LottoEightyEntity } from '../entities/lotto-eighty.entity';
import { LottoEighty } from '../../../domain/entities/lotto-eighty.entity';
import { ILottoEightyRepository } from '../../../domain/contracts/lotto-eighty.repository.interface';
import { RoundNumber } from '../../../domain/value-objects/round-number';
import {
  LottoEightyStatus,
  OverUnder,
  Range,
} from '../../../domain/enums/lotto-eighty';
import { Numbers } from '../../../domain/value-objects/numbers';
import { IPaginatedResult } from '@ninenine/contracts';

@Injectable()
export class LottoEightyRepository
  extends BaseRepository<LottoEighty, LottoEightyEntity>
  implements ILottoEightyRepository
{
  constructor(
    @InjectRepository(LottoEightyEntity)
    ormRepo: Repository<LottoEightyEntity>
  ) {
    super(ormRepo);
  }

  override async save(round: LottoEighty): Promise<LottoEighty> {
    return super.save(round, (domain) => this.mapToEntity(domain));
  }

  override async findPaginated(
    limit: number,
    offset: number,
    where?: FindOptionsWhere<LottoEightyEntity> | undefined,
    order?: FindOptionsOrder<LottoEightyEntity> | undefined
  ): Promise<IPaginatedResult<LottoEighty>> {
    return super.findPaginated(limit, offset, where, order);
  }

  async findCurrentRound(): Promise<LottoEighty | null> {
    const orm = await this.ormRepo.findOne({
      where: {
        status: Not(In([LottoEightyStatus.SETTLED, LottoEightyStatus.VOIDED])),
      },
      order: { createdAt: 'DESC' },
    });
    return orm ? this.mapToDomain(orm) : null;
  }

  async findLatestSettledRound(): Promise<LottoEighty | null> {
    const entity = await this.ormRepo.findOne({
      where: {
        status: LottoEightyStatus.SETTLED,
      },
      order: {
        roundNumber: 'DESC',
      },
    });
    return entity ? this.mapToDomain(entity) : null;
  }

  async findLatestTodayRound(): Promise<LottoEighty | null> {
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
  async findIncompleteRounds(): Promise<LottoEighty[]> {
    const ormList = await this.ormRepo.find({
      where: {
        status: In([
          LottoEightyStatus.OPEN,
          LottoEightyStatus.DRAWING,
          LottoEightyStatus.FINISHED,
        ]),
      },
      order: { createdAt: 'ASC' },
    });

    return ormList.map((orm) => this.mapToDomain(orm));
  }

  // Mappers
  protected mapToDomain(entity: LottoEightyEntity): LottoEighty {
    return LottoEighty.reconstitute(
      entity.id,
      new RoundNumber(entity.roundNumber),
      entity.drawnNumbers ? new Numbers(entity.drawnNumbers) : null,
      entity.sum,
      entity.drawnAt,
      entity.status as LottoEightyStatus,
      entity.overUnder as OverUnder | null,
      entity.range as Range | null,
      entity.isJackpot,
      entity.jackpotOn as Range | null,
      entity.closedAt,
      entity.openedAt,
      entity.createdAt,
      entity.updatedAt
    );
  }

  protected mapToEntity(domain: LottoEighty): LottoEightyEntity {
    const entity = new LottoEightyEntity();
    entity.id = domain.getId();
    entity.roundNumber = domain.getRoundNumber().getValue();
    entity.status = domain.getStatus();
    entity.openedAt = domain.getOpenedAt();
    entity.closedAt = domain.getClosedAt();
    entity.drawnNumbers = domain.getDrawnNumbers()?.getNumbers() ?? null;
    entity.drawnAt = domain.getDrawnAt();
    entity.sum = domain.getSum();
    entity.overUnder = domain.getOverUnder();
    entity.range = domain.getRange();
    entity.isJackpot = domain.getIsJackpot();
    entity.jackpotOn = domain.getJackpotOn();
    entity.createdAt = domain.getCreatedAt();
    entity.updatedAt = domain.getUpdatedAt();
    return entity;
  }
}
