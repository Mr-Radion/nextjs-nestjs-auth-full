import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
  Req,
  Ip,
  UploadedFile,
  UseInterceptors,
  Session,
  UnauthorizedException,
  // UsePipes,
} from '@nestjs/common';
import { Request } from 'express';
import {
  CreateUserDto,
  AddRoleDto,
  BanUserDto,
  // UpdateUserDto,
  RoleQueryDto,
  UserQueryDto,
  // UserDto,
} from './dto';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiTags,
  // ApiBody,
  // ApiImplicitFile,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Auth } from 'src/custom-decorators/auth.decorator';
import { RolesType } from '../roles/roles.types';
// import { LocalJwtAuthGuard} from '../auth/guards';
// import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
// import { redis } from '../../redis';
// import { UserEntity } from './entity/user.entity';
// import { ValidationPipe } from 'src/lib/pipes/validation.pipe';

@ApiTags('Пользователи')
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  // @ApiOperation({ summary: 'Получение всех пользователей' })
  // @ApiResponse({ status: 200, type: [UserEntity] })
  // we specify roles with a condition "or"
  // @UseGuards(AuthGuard('jwt'))
  @Auth()
  @Get()
  getAll(@Session() session: Record<string, any>, @Query() query: UserQueryDto) {
    try {
      // кол-во просмотров
      session['visits'] = session['visits'] ? session['visits'] + 1 : 1;
      console.log(session['visits']);
      return this.userService.getAllUsers(query);
    } catch (error) {
      console.log(error);
    }
  }

  // @ApiOperation({ summary: 'Получение пользователя по id' })
  // @ApiResponse({ status: 200, type: UserEntity })
  // @UseGuards(LocalJwtAuthGuard)
  // @UseGuards(AuthGuard('jwt')) // using custom local.strategy => local-auth.guard using PassportStrategy
  @Auth(RolesType.ADMIN)
  @Get('/getuser/:id')
  getOne(@Param('id') id: string) {
    try {
      return this.userService.getOneUser(id);
    } catch (error) {
      console.log(error);
    }
  }

  // @ApiOperation({ summary: 'Получение пользователя по токену' })
  // @ApiResponse({ status: 200, type: UserEntity })
  @Auth()
  @Get('/getme')
  async getMe(@Req() req: Request) {
    try {
      // const userId = await redis.get(`${id}`);  // альтернативный способ получить id, которое фиксируется при входе пользователя в систему, через сессии
      // if(req.session['userId'])  // альтернативный способ доступа к этому запросу, только залогиненному пользователю
      const userData = await this.userService.getMeAccount(req);
      if (!userData) {
        console.log('пустое значение');
        throw new UnauthorizedException({
          message: 'getMe controller1: пользователь не авторизован!',
        });
      }
      return userData;
    } catch (error) {
      console.log('getMe controller', error);
      throw new UnauthorizedException({
        message: 'getMe controller2: пользователь не авторизован!',
      });
    }
  }

  // @ApiOperation({ summary: 'Создание пользователя через почту' })
  // @ApiResponse({ status: 200, type: UserEntity })
  // @UsePipes(ValidationPipe)
  @Post()
  async create(
    @Req() req: any,
    @Ip() ip: string,
    @Body() userDto: CreateUserDto,
    @Res({ passthrough: true }) response: any,
  ) {
    try {
      // console.log(userDto);
      const fingerprint = req.headers['fingerprint'];
      const os = req.headers['sec-ch-ua-platform'];
      console.log({ fingerprint });
      const userData = await this.userService.createUser(userDto, ip, req.headers['user-agent'], fingerprint, os);
      console.log(userData);
      response.cookie('token', userData.user.refreshToken, {
        maxAge: 60 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
      });
      return userData;
    } catch (error) {
      console.log(error);
    }
  }

  @ApiResponse({
    status: 200,
    description: 'The found record is executed',
    type: Boolean,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Update one Avatar for current User 👻',
  })
  @Post('avatar')
  @ApiConsumes('multipart/form-data')
  // @ApiImplicitFile({
  //   name: 'avatar',
  //   required: true,
  //   description: 'Send one file',
  // })
  // @ApiBody({
  //   examples: {
  //     name: 'avatar',
  //     description: 'Send one file',
  //   },
  // })
  @UseInterceptors(FileInterceptor('avatar'))
  updateAvatar(@Req() req: any, @UploadedFile() file: any) {
    const { user } = req;
    const { id } = user;

    return this.userService.updateAvatar(id, file);
  }

  // @ApiOperation({ summary: 'Удаление пользователя' })
  // @ApiResponse({ status: 200 })
  @Auth(RolesType.ADMIN)
  @Delete('remove/:id')
  removeUserOne(@Param('id') id: string) {
    try {
      return this.userService.deleteUserOne(id);
    } catch (error) {
      console.log(error);
    }
  }

  // @ApiOperation({ summary: 'Забанить пользователя' })
  // @ApiResponse({ status: 200 })
  @Auth(RolesType.ADMIN)
  @Put('/ban/:userid')
  ban(@Param('userid') userid: string, @Body() dto: BanUserDto) {
    try {
      return this.userService.banUser(userid, dto);
    } catch (error) {
      console.log(error);
    }
  }

  // @ApiOperation({ summary: 'Разблокировать пользователя' })
  // @ApiResponse({ status: 200 })
  @Auth(RolesType.ADMIN)
  @Post('/ban/:userid')
  unlock(@Param('userid') userid: string) {
    try {
      return this.userService.unlockUser(userid);
    } catch (error) {
      console.log(error);
    }
  }

  // @ApiOperation({ summary: 'Добавить роль пользователю' })
  // @ApiResponse({ status: 200 })
  @Auth(RolesType.ADMIN)
  @Put('/role/:userid')
  addRole(@Req() req: Request, @Param('userid') userid: string, @Body() dto: AddRoleDto) {
    try {
      // альтернативный вариант проверки роли, через сессии
      // if (req.session['roles'].some(role => role.value === RolesType.ADMIN))
      return this.userService.addRoleUser(userid, dto);
    } catch (error) {
      console.log(error);
    }
  }

  // @ApiOperation({ summary: 'Удалить роль пользователю' })
  // @ApiResponse({ status: 200 })
  @Auth(RolesType.ADMIN)
  @Delete('/role')
  removeRole(@Query() query: RoleQueryDto) {
    try {
      return this.userService.removeRoleUser(query);
    } catch (error) {
      console.log(error);
    }
  }
}
