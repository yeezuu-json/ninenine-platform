import {
  FindOptionsOrder,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { IPaginatedResult } from '@ninenine/contracts';

export abstract class BaseRepository<TDomain, TOrm extends ObjectLiteral> {
  protected constructor(protected readonly ormRepo: Repository<TOrm>) {}

  protected abstract mapToDomain(ormEntity: TOrm): TDomain;
  protected abstract mapToEntity(domain: TDomain): TOrm;

  async findById(id: string): Promise<TDomain | null> {
    const found = await this.ormRepo.findOneBy({
      id,
    } as unknown as FindOptionsWhere<TOrm>);
    return found ? this.mapToDomain(found) : null;
  }

  async findAll(): Promise<TDomain[]> {
    const ormEntities = await this.ormRepo.find();
    return ormEntities.map((orm) => this.mapToDomain(orm));
  }

  async findPaginated(
    limit: number,
    offset: number,
    where?: FindOptionsWhere<TOrm>,
    order?: FindOptionsOrder<TOrm>
  ): Promise<IPaginatedResult<TDomain>> {
    const [rows, count] = await this.ormRepo.findAndCount({
      where,
      take: limit,
      skip: offset,
      order: order,
    });
    return {
      total: count,
      items: rows.map((r) => this.mapToDomain(r)),
      limit,
      offset,
    };
  }

  async save(domain: TDomain): Promise<TDomain> {
    const ormEntity = this.mapToEntity(domain);
    const saved = await this.ormRepo.save(ormEntity);
    return this.mapToDomain(saved);
  }

  async softDelete(id: string): Promise<void> {
    await this.ormRepo.softDelete(id);
  }

  async existsById(id: string): Promise<boolean> {
    const count = await this.ormRepo.count({
      where: { id } as unknown as FindOptionsWhere<TOrm>,
    });
    return count > 0;
  }
}
