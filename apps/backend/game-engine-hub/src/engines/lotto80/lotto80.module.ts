import { Module } from '@nestjs/common';
import { Lotto80PersistenceModule } from './infrastructure/persistence/lotto80-persistence.module';
import { Lotto80EventsModule } from './infrastructure/events/lotto80-events.module';
import { Lotto80Service } from './application/services/lotto80.service';
import { Lotto80SchedulerService } from './application/services/lotto80-scheduler.service';
import { RngModule } from '../../shared/rng';
import { Lotto80Controller } from './presentations/http/lotto80.controller';

@Module({
  imports: [Lotto80PersistenceModule, Lotto80EventsModule, RngModule],
  controllers: [Lotto80Controller],
  providers: [Lotto80Service, Lotto80SchedulerService],
})
export class Lotto80Module {}
