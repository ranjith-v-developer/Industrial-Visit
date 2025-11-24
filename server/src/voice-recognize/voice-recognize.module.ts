import { Module } from '@nestjs/common';
import { VoiceRecognizeService } from './voice-recognize.service';
import { VoiceRecognizeController } from './voice-recognize.controller';
import { PredictModule } from 'src/predict/predict.module';

@Module({
  imports: [PredictModule],
  controllers: [VoiceRecognizeController],
  providers: [VoiceRecognizeService],
  exports: [VoiceRecognizeService],
})
export class VoiceRecognizeModule {}
