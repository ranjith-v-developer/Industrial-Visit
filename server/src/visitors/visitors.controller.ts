import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guard/role-auth.guard';
import { VisitorsService } from './visitors.service';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { VisitorRO } from './interfaces/visitors.interface';

@ApiTags('visitor')
@Controller('visitor')
export class VisitorsController {
  constructor(private readonly visitsService: VisitorsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('institute')
  @Post()
  create(@Body() createVisitorDto: CreateVisitorDto[], @Request() req) {
    return this.visitsService.create(createVisitorDto, req.user);
  }

  @Get()
  async findAll(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
    @Query('sort') sort: string,
    @Query('q') searchText: string,
  ): Promise<any[]> {
    const filters = {};
    filters['sort'] = sort;
    filters['searchText'] = searchText;

    return await this.visitsService.findAll(offset, limit, filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<VisitorRO> {
    return await this.visitsService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('industry', 'institute')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateVisitorDto: VisitorRO) {
    return await this.visitsService.update(id, updateVisitorDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('industry', 'institute')
  @Put('multiple')
  async updateMultiple(@Body() updateVisitorDto: VisitorRO[]) {
    return await this.visitsService.updateMultiple(updateVisitorDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('institute')
  @Delete(':id')
  async deleteOne(@Param('id') id: string) {
    return await this.visitsService.delete(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('industry')
  @Post(':id/feedback-notification')
  feedbackNotification(@Param('id') id: string) {
    return this.visitsService.feedbackNotification(id);
  }

  @Post(':id/feedback-submission')
  sentFeedback(@Param('id') id: string, @Body() feedback: any) {
    return this.visitsService.sentFeedback(id, feedback);
  }
}
