import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IndInsService } from './ind-ins.service';
import { CreateIndInsDto } from './dto/create-ind-ins.dto';
import { UpdateIndInsDto } from './dto/update-ind-ins.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { IndInsRO } from './interfaces/ind-ins.interface';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guard/role-auth.guard';

@ApiTags('ind-ins')
@Controller('ind-ins')
export class IndInsController {
  constructor(private readonly indInsService: IndInsService) {}

  @Post()
  @ApiBody({ type: CreateIndInsDto })
  async create(@Body() createIndInsDto: CreateIndInsDto) {
    return this.indInsService.create(createIndInsDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('support')
  @Post('bulk')
  @ApiBody({ type: CreateIndInsDto })
  async createBulk(@Body() createIndInsDto: CreateIndInsDto[]) {
    return this.indInsService.createBulk(createIndInsDto);
  }

  @Get()
  async findAll(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
    @Query('sort') sort: string,
    @Query('q') searchText: string,
    @Query('status') status: string,
  ): Promise<IndInsRO[]> {
    const filters = {};
    filters['sort'] = sort;
    filters['searchText'] = searchText;
    filters['status'] = status;

    return await this.indInsService.findAll(offset, limit, filters);
  }

  @Get('count')
  async findCount(@Query('status') status: string): Promise<any> {
    const filters = {};
    filters['status'] = status;
    return await this.indInsService.findCount(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IndInsRO> {
    return await this.indInsService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('support')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateIndInsDto: UpdateIndInsDto,
  ) {
    return await this.indInsService.update(id, updateIndInsDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('support')
  @Patch('/verification/:id')
  async verification(
    @Param('id') id: string,
    @Body() updateIndInsDto: UpdateIndInsDto,
  ) {
    return await this.indInsService.update(id, updateIndInsDto, true);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('support')
  @Delete(':id')
  async deleteOne(@Param('id') id: string) {
    return await this.indInsService.delete(id);
  }
}
