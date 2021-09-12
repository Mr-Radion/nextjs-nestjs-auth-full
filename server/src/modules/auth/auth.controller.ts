import { Body, Controller, Post, Get, Param, Redirect, Res, UseGuards } from '@nestjs/common';
// import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Cookies } from 'src/lib/custom-decorators/cookies';
import { Roles } from 'src/lib/custom-decorators/roles-auth';
import { CreateUserDto } from '../users/dto';
import { AuthService } from './auth.service';
import { RolesGuard } from './roles.guard';
import { RefreshTokenSessionsEntity } from './entity/refresh.token.entity';

// @ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // @ApiOperation({ summary: 'Вход в аккаунт' })
  // @ApiResponse({ status: 200, type: [RefreshTokenSessionsEntity] })
  @Post('/login')
  async login(@Body() dto: CreateUserDto, @Res({ passthrough: true }) response: any) {
    try {
      console.log(dto, 'auth', 20);
      const userData = await this.authService.login(dto);
      response.cookie('token', userData.refreshToken, {
        maxAge: 60 * 24 * 68 * 68 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
      });
      return userData;
    } catch (error) {
      console.log(error);
    }
  }

  // @ApiOperation({ summary: 'Ссылка для подтверждения почты и активации аккаунта' })
  // @ApiResponse({ status: 200, type: '25d92822-8673-4008-90af-4f5e19165f24' })
  @Get('/activate/:link')
  @Redirect(process.env.CLIENT_URL, 302)
  async activate(@Param('link') activationLink: string) {
    try {
      const authLink = await this.authService.activateAccount(activationLink);
      if (authLink.isActivated) {
        return { url: 'http://localhost:3000' };
      }
    } catch (error) {
      console.log(error);
    }
  }

  // @ApiOperation({ summary: 'Обновление токена' })
  // @ApiResponse({ status: 200, type: [RefreshTokenSessionsEntity] })
  @Post('/refresh')
  async refresh(@Cookies('token') refreshtoken: string, @Res({ passthrough: true }) response: any) {
    try {
      const userData = await this.authService.refreshToken(refreshtoken);
      response.cookie('token', userData.refreshToken, {
        maxAge: 60 * 24 * 68 * 68 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // управляют видимостью cookie в браузере
      });
      return userData;
    } catch (error) {
      console.log(error);
    }
  }

  // @ApiOperation({ summary: 'Выход из приложения' })
  // @ApiResponse({ status: 200 })
  @Post('/logout')
  async logout(@Cookies('token') refreshtoken: string, @Res({ passthrough: true }) response: any) {
    try {
      const token = await this.authService.logout(refreshtoken);
      response.clearCookie('token');
      return token;
    } catch (error) {
      console.log(error);
    }
  }
}
