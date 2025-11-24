import { forwardRef, Module } from '@nestjs/common';
import { ChartService } from './chart.service';
import { ChartController } from './chart.controller';
import { UserModule } from 'src/users/users.module';
import { IndustrialVisitModule } from 'src/industrial-visit/industrial-visit.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndustrialVisitEntity } from 'src/industrial-visit/entities/industrial-visit.entity';

@Module({
  controllers: [ChartController],
  providers: [ChartService],
  imports: [
    TypeOrmModule.forFeature([IndustrialVisitEntity]),
    forwardRef(() => UserModule),
    forwardRef(() => IndustrialVisitModule),
  ],
})
export class ChartModule {}
