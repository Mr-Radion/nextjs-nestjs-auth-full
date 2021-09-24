import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Redirect,
  Res,
  UseGuards,
  Ip,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
// import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Cookies } from 'src/lib/custom-decorators/cookies';
// import { Roles } from 'src/lib/custom-decorators/roles-auth';
import { CreateUserDto } from '../users/dto';
import { AuthService } from './auth.service';
// import { RolesGuard } from './roles.guard';
// import { RefreshTokenSessionsEntity } from './entity/refresh.token.entity';

// @ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // @ApiOperation({ summary: 'Вход в аккаунт' })
  // @ApiResponse({ status: 200, type: [RefreshTokenSessionsEntity] })
  @Post('/login')
  async login(
    @Ip() ip: any,
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) response: any,
  ) {
    try {
      console.log(dto, 'auth', 21);
      const userData = await this.authService.login(dto, ip);
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
  async refresh(
    @Ip() ip: any,
    @Cookies('token') refreshtoken: string,
    @Res({ passthrough: true }) response: any,
  ) {
    try {
      const userData = await this.authService.refreshToken(refreshtoken, ip);
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

  @Get('/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('/google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Ip() ip: any,
    @Req() req: any,
    @Res({ passthrough: true }) response: any,
  ) {
    try {
      const userData = await this.authService.googleLogin(req, ip, 'googleId');
      if (!userData['user'].refreshToken) {
        return 'No user refreshToken from google';
      }
      if (userData) {
        response.cookie('token', userData['user'].refreshToken, {
          maxAge: 60 * 24 * 68 * 68 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development', // управляют видимостью cookie в браузере
        });
      }
      response.send(
        `<script>window.opener.postMessage('${JSON.stringify(
          userData,
        )}', '*');window.close()</script>`,
      );
    } catch (error) {
      console.log('googleAuthRedirect controller error', error?.message);
    }
  }

  @Get('/facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get('/facebook/redirect')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginRedirect(
    @Ip() ip: any,
    @Req() req: any,
    @Res({ passthrough: true }) response: any,
  ) {
    try {
      const userData = await this.authService.facebookLogin(req, ip, 'facebookId');
      if (!userData['user'].refreshToken) {
        return 'No user refreshToken from facebook';
      }
      if (userData) {
        response.cookie('token', userData['user'].refreshToken, {
          maxAge: 60 * 24 * 68 * 68 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development', // управляют видимостью cookie в браузере
        });
      }
      response.send(
        `<script>window.opener.postMessage('${JSON.stringify(
          userData,
        )}', '*');window.close()</script>`,
      );
    } catch (error) {
      console.log('/facebook/redirect controller error', error?.message);
    }
  }

  @Get('/vkontakte')
  @UseGuards(AuthGuard('vkontakte'))
  async vkontakteLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get('/vkontakte/redirect')
  @UseGuards(AuthGuard('vkontakte'))
  async vkontakteLoginRedirect(
    @Ip() ip: any,
    @Req() req: any,
    @Res({ passthrough: true }) response: any,
  ) {
    try {
      const userData = await this.authService.vkontakteLogin(req, ip, 'vkontakteId');
      if (!userData['user'].refreshToken) {
        return 'No user refreshToken from vkontakte';
      }
      if (userData) {
        response.cookie('token', userData['user'].refreshToken, {
          maxAge: 60 * 24 * 68 * 68 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development', // управляют видимостью cookie в браузере
        });
      }
      response.send(
        `<script>window.opener.postMessage('${JSON.stringify(
          userData,
        )}', '*');window.close()</script>`,
      );
    } catch (error) {
      console.log('/vkontakte/redirect controller error', error?.message);
    }
  }

  @Get('/odnoklassniki')
  @UseGuards(AuthGuard('odnoklassniki'))
  async odnoklassnikiLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get('/odnoklassniki/redirect')
  @UseGuards(AuthGuard('odnoklassniki'))
  async odnoklassnikiLoginRedirect(
    @Ip() ip: any,
    @Req() req: any,
    @Res({ passthrough: true }) response: any,
  ) {
    try {
      const userData = await this.authService.odnoklassnikiLogin(req, ip, 'odnoklassnikiId');
      if (!userData['user'].refreshToken) {
        return 'No user refreshToken from odnoklassniki';
      }
      if (userData) {
        response.cookie('token', userData['user'].refreshToken, {
          maxAge: 60 * 24 * 68 * 68 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development', // управляют видимостью cookie в браузере
        });
      }
      response.send(
        `<script>window.opener.postMessage('${JSON.stringify(
          userData,
        )}', '*');window.close()</script>`,
      );
    } catch (error) {
      console.log('/odnoklassniki/redirect controller error', error?.message);
    }
  }

  @Get('/mailru')
  @UseGuards(AuthGuard('mailru'))
  async mailruLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get('/mailru/redirect')
  @UseGuards(AuthGuard('mailru'))
  async mailruLoginRedirect(
    @Ip() ip: any,
    @Req() req: any,
    @Res({ passthrough: true }) response: any,
  ) {
    try {
      const userData = await this.authService.mailruLogin(req, ip, 'mailruId');
      if (!userData['user'].refreshToken) {
        return 'No user refreshToken from mailru';
      }
      if (userData) {
        response.cookie('token', userData['user'].refreshToken, {
          maxAge: 60 * 24 * 68 * 68 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development', // управляют видимостью cookie в браузере
        });
      }
      response.send(
        `<script>window.opener.postMessage('${JSON.stringify(
          userData,
        )}', '*');window.close()</script>`,
      );
    } catch (error) {
      console.log('/mailru/redirect controller error', error?.message);
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
