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
import { UserRO } from './interfaces/user.interface';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guard/role-auth.guard';

@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('user')
  async create(@Body() userData: CreateUserDto) {
    return this.userService.create(userData);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async findAll(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
    @Query('sort') sort: string,
  ): Promise<UserRO[]> {
    return await this.userService.findAll(offset, limit, sort);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:id')
  async findOne(@Param('id') id: string): Promise<UserRO> {
    return await this.userService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('user/:id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('support')
  @Delete('user/:id')
  async deleteOne(@Param('id') id: string) {
    return await this.userService.delete(id);
  }
}
