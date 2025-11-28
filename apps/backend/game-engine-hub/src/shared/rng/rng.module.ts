import { Module } from '@nestjs/common';
import { SeededRngService } from './seeded-rng.service';
import { RoundVerificationService } from './round-verification.service';

export const RNG_SERVICE = Symbol('IRngService');

@Module({
  providers: [
    SeededRngService,
    RoundVerificationService,
    {
      provide: RNG_SERVICE,
      useExisting: SeededRngService,
    },
    {
      provide: 'RngService',
      useExisting: SeededRngService,
    },
  ],
  exports: [RNG_SERVICE, 'RngService', SeededRngService, RoundVerificationService],
})
export class RngModule {}
