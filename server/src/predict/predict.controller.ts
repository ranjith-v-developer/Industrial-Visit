// Inside your controller
import { Controller, Get, Query } from '@nestjs/common';
import { PredictService } from './predict.service';

@Controller('predict')
export class PredictController {
  constructor(private readonly predictService: PredictService) {}

  @Get()
  async getPrediction(@Query('input') input: string): Promise<any> {
    return await this.predictService.runPythonScript(input);
  }
}
