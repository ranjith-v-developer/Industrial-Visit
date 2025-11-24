import { forwardRef, Module } from '@nestjs/common';
import { PredictService } from './predict.service';
import { PredictController } from './predict.controller';
import { IndustrialVisitModule } from 'src/industrial-visit/industrial-visit.module';

@Module({
  imports: [forwardRef(() => IndustrialVisitModule)],
  controllers: [PredictController],
  providers: [PredictService],
  exports: [PredictService],
})
export class PredictModule {}
