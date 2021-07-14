import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoleService } from './roles.service';
import { CreateRoleDto } from './dto';
import { Roles } from 'src/lib/custom-decorators/roles-auth';
import { JwtAutGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from './schemas';

@ApiTags('Пользователи')
@Controller('roles')
export class RolesController {
  constructor(private roleService: RoleService) {}

  @ApiOperation({ summary: 'Создание роли администратором' })
  @ApiResponse({ status: 200, type: Role })
  @UseGuards(JwtAutGuard)
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() dto: CreateRoleDto) {
    try {
      return this.roleService.createRole(dto);
    } catch (error) {
      console.log(error);
    }
  }

  @ApiOperation({ summary: 'Посмотреть описание роли' })
  @ApiResponse({ status: 200, type: Role })
  @UseGuards(JwtAutGuard)
  @Get('/:value')
  getByValue(@Param('value') value: string) {
    return this.roleService.getRoleByValue(value);
  }
}
