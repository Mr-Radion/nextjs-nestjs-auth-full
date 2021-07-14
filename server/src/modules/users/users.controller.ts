import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Patch,
  Query,
  Res,
  UseGuards,
  Req,
  // UsePipes,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Express } from 'express';
import { Roles } from 'src/lib/custom-decorators/roles-auth';
import { JwtAutGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import {
  CreateUserDto,
  AddRoleDto,
  BanUserDto,
  UpdateUserDto,
  RoleQueryDto,
  UserQueryDto,
  // UserDto,
} from './dto';
import { UsersService } from './users.service';
import { User } from './schemas';
// import { ValidationPipe } from 'src/lib/pipes/validation.pipe';

@ApiTags('Пользователи')
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @ApiOperation({ summary: 'Получение всех пользователей' })
  @ApiResponse({ status: 200, type: [User] })
  @UseGuards(JwtAutGuard)
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Get()
  getAll(@Query() query: UserQueryDto) {
    try {
      return this.userService.getAllUsers(query);
    } catch (error) {
      console.log(error);
    }
  }

  @ApiOperation({ summary: 'Получение пользователя по id' })
  @ApiResponse({ status: 200, type: User })
  @UseGuards(JwtAutGuard)
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Get('/getuser/:id')
  getOne(@Param('id') id: string) {
    try {
      console.log(id, 47);
      return this.userService.getOneUser(id);
    } catch (error) {
      console.log(error);
    }
  }

  @ApiOperation({ summary: 'Получение пользователя по токену' })
  @ApiResponse({ status: 200, type: User })
  @UseGuards(JwtAutGuard)
  @Get('/getme')
  getMe(@Req() req: Request) {
    try {
      return this.userService.getMeAccount(req.headers.authorization);
    } catch (error) {
      console.log(error);
    }
  }

  @ApiOperation({ summary: 'Создание пользователя через почту' })
  @ApiResponse({ status: 200, type: User })
  // @UsePipes(ValidationPipe)
  @Post()
  async create(@Body() userDto: CreateUserDto, @Res({ passthrough: true }) response: any) {
    try {
      const userData = await this.userService.createUser(userDto);
      response.cookie('fcd', userData.refreshToken, {
        maxAge: 60 * 24 * 68 * 68 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
      });
      return userData;
    } catch (error) {
      console.log(error);
    }
  }

  @ApiOperation({ summary: 'Редактирование своего профиля' })
  @ApiResponse({ status: 200, type: User })
  @UseGuards(JwtAutGuard)
  @Roles('USER', 'MANAGER', 'ADMIN')
  @UseGuards(RolesGuard)
  @Patch()
  editMe(@Req() req: Request, @Body() userDto: UpdateUserDto) {
    try {
      return this.userService.editMyProfile(req.headers.authorization, userDto);
    } catch (error) {
      console.log(error);
    }
  }

  @ApiOperation({ summary: 'Редактирование профиля пользователя админом' })
  @ApiResponse({ status: 200, type: User })
  @UseGuards(JwtAutGuard)
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Patch(':id')
  edit(@Param('id') id: string, @Body() userDto: UpdateUserDto) {
    try {
      return this.userService.editUser(id, userDto);
    } catch (error) {
      console.log(error);
    }
  }

  @ApiOperation({ summary: 'Удаление пользователя' })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAutGuard)
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete('remove/:id')
  removeUserOne(@Param('id') id: string) {
    try {
      return this.userService.deleteUserOne(id);
    } catch (error) {
      console.log(error);
    }
  }

  @ApiOperation({ summary: 'Забанить пользователя' })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAutGuard)
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Put('/ban/:userid')
  ban(@Param('userid') userid: string, @Body() dto: BanUserDto) {
    try {
      return this.userService.banUser(userid, dto);
    } catch (error) {
      console.log(error);
    }
  }

  @ApiOperation({ summary: 'Разблокировать пользователя' })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAutGuard)
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Post('/ban/:userid')
  unlock(@Param('userid') userid: string) {
    try {
      return this.userService.unlockUser(userid);
    } catch (error) {
      console.log(error);
    }
  }

  @ApiOperation({ summary: 'Добавить роль пользователю' })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAutGuard)
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Put('/role/:userid')
  addRole(@Param('userid') userid: string, @Body() dto: AddRoleDto) {
    try {
      return this.userService.addRoleUser(userid, dto);
    } catch (error) {
      console.log(error);
    }
  }

  @ApiOperation({ summary: 'Удалить роль пользователю' })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAutGuard)
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete('/role')
  removeRole(@Query() query: RoleQueryDto) {
    try {
      return this.userService.removeRoleUser(query);
    } catch (error) {
      console.log(error);
    }
  }
}
