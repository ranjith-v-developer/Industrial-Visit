import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { ChartService } from './chart.service';
import { ChartDto } from './dto/chart.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role-auth.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';

@Controller('chart')
export class ChartController {
  constructor(private readonly chartService: ChartService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('industry', 'institute')
  @Post()
  create(@Body() chartPayload: ChartDto[], @Request() req) {
    return this.chartService.filterData(chartPayload, req.user);
  }
}
