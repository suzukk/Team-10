import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { ListingsController } from './listings/listings.controller.js';
import { ListingsRepository } from './listings/listings.repository.js';
import { ListingsService } from './listings/listings.service.js';

@Module({
  controllers: [HealthController, ListingsController],
  providers: [ListingsService, ListingsRepository],
})
export class AppModule {}
