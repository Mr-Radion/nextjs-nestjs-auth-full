import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
// import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoleService } from './roles.service';
import { CreateRoleDto } from './dto';
// import { Roles } from 'src/lib/custom-decorators/roles-auth';
// import { JwtAutGuard } from '../auth/jwt-auth.guard';
import { Auth } from 'src/custom-decorators/auth.decorator';
import { RolesType } from './roles.types';
// import { RolesGuard } from '../auth/roles.guard';
// import { RoleEntity } from './entity/roles.entity';

// @ApiTags('Пользователи')
@Controller('roles')
export class RolesController {
  constructor(private roleService: RoleService) {}

  // @ApiOperation({ summary: 'Создание роли администратором' })
  // @ApiResponse({ status: 200, type: RoleEntity })
  // @UseGuards(JwtAutGuard)
  // @Roles('ADMIN')
  // @UseGuards(RolesGuard)
  // @Auth(RolesType.USER)
  @Post()
  create(@Body() dto: CreateRoleDto) {
    try {
      return this.roleService.createRole(dto);
    } catch (error) {
      console.log(error);
    }
  }

  // @ApiOperation({ summary: 'Посмотреть описание роли' })
  // @ApiResponse({ status: 200, type: RoleEntity })
  // @UseGuards(JwtAutGuard)
  @Get('/:value')
  getByValue(@Param('value') value: string) {
    return this.roleService.getRoleByValue(value);
  }
}
