import { Controller, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { VoiceRecognizeService } from './voice-recognize.service';
import { FileInterceptor } from '@nestjs/platform-express';
import  { multerOptions } from 'src/config/multer-config';
import * as path from 'path';

@Controller('voice-recognize')
export class VoiceRecognizeController {
  constructor(private readonly voiceRecognizeService: VoiceRecognizeService) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file', multerOptions('./uploads')))
  async upload( @UploadedFile() file: Express.Multer.File) {
    const filePath = path.join(
      __dirname.replace('/dist/voice-recognize', ''),
      'uploads',
      file.filename,
    );
    try {
      return await this.voiceRecognizeService.processAudioFile(filePath);
    } catch (error) {
      return error;
    }
  }
}
