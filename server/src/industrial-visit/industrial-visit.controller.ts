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
} from '@nestjs/common';
import { IndustrialVisitService } from './industrial-visit.service';
import { CreateIndustrialVisitDto } from './dto/create-industrial-visit.dto';
import { UpdateIndustrialVisitDto } from './dto/update-industrial-visit.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guard/role-auth.guard';
import { IndustrialVisitRO } from './interfaces/industrial-visit.interface';

@ApiTags('industrial-visit')
@Controller('industrial-visit')
export class IndustrialVisitController {
  constructor(
    private readonly industrialVisitService: IndustrialVisitService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('industry')
  @Post()
  create(
    @Body() createIndustrialVisitDto: CreateIndustrialVisitDto,
    @Request() req,
  ) {
    return this.industrialVisitService.create(
      createIndustrialVisitDto,
      req.user,
    );
  }

  @Get()
  async findAll(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
    @Query('sort') sort: string,
    @Query('q') searchText: string,
    @Query('industry') industry: string,
    @Query('institute') institute: string,
  ): Promise<any[]> {
    const filters = {};
    filters['sort'] = sort;
    filters['searchText'] = searchText;
    filters['industry'] = industry;
    filters['institute'] = institute;

    return await this.industrialVisitService.findAll(offset, limit, filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IndustrialVisitRO> {
    return await this.industrialVisitService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('industry', 'support')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateIndustrialVisitDto: UpdateIndustrialVisitDto,
  ) {
    return await this.industrialVisitService.update(
      id,
      updateIndustrialVisitDto,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('industry', 'support')
  @Delete(':id')
  async deleteOne(@Param('id') id: string) {
    return await this.industrialVisitService.delete(id);
  }
}
