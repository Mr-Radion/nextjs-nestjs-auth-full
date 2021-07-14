import { Body, Controller, Post, Get, Param, Redirect, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Cookies } from 'src/lib/custom-decorators/cookies';
import { Roles } from 'src/lib/custom-decorators/roles-auth';
import { CreateUserDto } from '../users/dto';
import { AuthService } from './auth.service';
import { RolesGuard } from './roles.guard';
import { RefreshTokenSessions } from './schemas';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Вход в аккаунт' })
  @ApiResponse({ status: 200, type: [RefreshTokenSessions] })
  @Post('/login')
  async login(@Body() dto: CreateUserDto, @Res({ passthrough: true }) response: any) {
    try {
      const userData = await this.authService.login(dto);
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

  @ApiOperation({ summary: 'Ссылка для подтверждения почты и активации аккаунта' })
  @ApiResponse({ status: 200, type: '25d92822-8673-4008-90af-4f5e19165f24' })
  @Get('/activate/:link')
  @Redirect(process.env.CLIENT_URL, 302)
  activate(@Param('link') activationLink: string) {
    try {
      return this.authService.activateAccount(activationLink);
    } catch (error) {
      console.log(error);
    }
  }

  @ApiOperation({ summary: 'Обновление токена' })
  @ApiResponse({ status: 200, type: [RefreshTokenSessions] })
  @Post('/refresh')
  async refresh(@Cookies('fcd') refreshtoken: string, @Res({ passthrough: true }) response: any) {
    try {
      const userData = await this.authService.refreshToken(refreshtoken);
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

  @ApiOperation({ summary: 'Выход из приложения' })
  @ApiResponse({ status: 200 })
  @Post('/logout')
  async logout(@Cookies('fcd') refreshtoken: string, @Res({ passthrough: true }) response: any) {
    try {
      const token = await this.authService.logout(refreshtoken);
      response.clearCookie('fcd');
      return token;
    } catch (error) {
      console.log(error);
    }
  }
}
