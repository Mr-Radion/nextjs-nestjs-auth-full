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
  Session,
  Put,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { UserEntity } from '../users/entity';
import { AuthGuard } from '@nestjs/passport';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Cookies } from 'src/custom-decorators/cookies';
import { CreateUserDto } from '../users/dto';
import { AuthService } from './auth.service';
import { hasUserAgent } from 'src/utils/has-user-agent';
import { RefreshTokenSessionsEntity } from './entity';
// import { LocalAuthGuard } from './guards';
// import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

// @ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @InjectRepository(UserEntity) private readonly userModel: Repository<UserEntity>,
  ) {}

  // При авторизации мы получаем новые access и refresh токены с обновленным сроком
  // @ApiOperation({ summary: 'Вход в аккаунт' })
  // @ApiResponse({ status: 200, type: [RefreshTokenSessionsEntity] })
  // about AuthGuard('local') and LocalAuthGuard
  // 1. The route handler will only be invoked if the user has been validated
  // 2. The req parameter will contain a user property (populated by Passport during the passport-local authentication flow)
  // @UseGuards(AuthGuard('local'))  // using local.strategy using PassportStrategy
  // @UseGuards(LocalAuthGuard) // using custom local.strategy => local-auth.guard using PassportStrategy
  @Post('/login')
  async login(
    @Ip() ip: any,
    @Req() req: Request,
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) response: any,
  ) {
    try {
      const fingerprint = req.headers['fingerprint'];
      const os = req.headers['sec-ch-ua-platform'];
      const userData = await this.authService.login(
        dto,
        ip,
        req.headers['user-agent'],
        fingerprint,
        os,
      );
      // if (userData.user.isActivated === false) {
      //   return 'подтвердите email';
      // }
      req.session['userId'] = userData.user.user.id;
      req.session['roles'] = userData.user.user.roles;
      if (userData && !hasUserAgent(req).mobile) {
        response.clearCookie('token');
        response.cookie('token', userData.user.refreshToken, {
          maxAge: 60 * 24 * 60 * 60 * 1000, // 60 days unix-time
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development',
          sameSite: true,
        });
        delete userData.user.refreshToken;
        return userData;
      }
      if (userData && hasUserAgent(req).mobile) return userData;
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
        return { url: process.env.CLIENT_URL };
      }
    } catch (error) {
      console.log(error);
    }
  }

  // В данном маршруте мы получаем новые access и refresh токены с обновленным сроком
  // @ApiOperation({ summary: 'Обновление токена' })
  // @ApiResponse({ status: 200, type: [RefreshTokenSessionsEntity] })
  @Get('/refresh')
  async refreshGet(
    @Ip() ip: any,
    @Req() req: any,
    @Cookies('token') refreshtoken: string,
    @Res({ passthrough: true }) response: any,
  ) {
    try {
      const os = req.headers['sec-ch-ua-platform'];
      const fingerprint = req.headers['fingerprint'];
      console.log({ fingerprint });
      // console.log(os); // обрезать двоеточии по бокам
      console.log(req.headers);
      const userData = await this.authService.refreshToken(
        !hasUserAgent(req).mobile ? refreshtoken : req.body.refreshToken,
        ip,
        req.headers['user-agent'],
        os,
        response,
        fingerprint,
      ); // на стороне клиента лучше сохранять access token, а в серверном куки остается рефреш
      if (userData && !hasUserAgent(req).mobile) {
        response.clearCookie('token');
        response.cookie('token', userData.user.refreshToken, {
          maxAge: 60 * 24 * 60 * 60 * 1000,
          httpOnly: true, // управляет доступностью, через js document, true делает недоступным для js клиента
          sameSite: true, // defense against some classes of cross-site request forgery (CSRF) attacks
          secure: process.env.NODE_ENV !== 'development', // true делает куки невидимым при http соединениях и гарантирует передачу куки, только через https соединение
        });
        delete userData.user.refreshToken;
        return userData;
      }
      if (userData && hasUserAgent(req).mobile) return userData;
    } catch (error) {
      console.log(error);
    }
  }

  @Post('/find_token')
  async findToken(@Ip() ip: any, @Req() req: any, @Res({ passthrough: true }) response: any) {
    try {
      console.log({ body: req.body });
      console.log({ req: req });
      // перенести для аутенфикации в соотв контроллер или тут исправить, но помнить об ощибке установления заголовка, после отправки результата
      // req.session.userId = req.body.userId;
      // req.session['roles'] = userDataAndTokens['user'].user.roles;

      const findUser = await this.userModel.findOneOrFail({ id: req.body.userId });

      if (findUser?.banned)
        throw new UnauthorizedException({
          message: `Вы забанены ${findUser.banReason}`,
        });

      // preservation and issuance of tokens
      const userDataAndTokens = await this.authService.tokenSession(
        findUser,
        ip,
        req.headers['user-agent'],
        req.headers['fingerprint'],
        req.headers['sec-ch-ua-platform'],
      );

      if (userDataAndTokens && !hasUserAgent(req).mobile) {
        response.clearCookie('token');
        response.cookie('token', userDataAndTokens['user'].refreshToken, {
          maxAge: 60 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          sameSite: true,
          secure: process.env.NODE_ENV !== 'development',
        });
        delete userDataAndTokens['user'].refreshToken;
        return userDataAndTokens;
      }

      // for mobile
      return userDataAndTokens;
    } catch (error) {
      console.log('findToken controller error', error?.message);
      throw new HttpException(`Нету доступа`, HttpStatus.FORBIDDEN);
    }
  }

  @Get('/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    return HttpStatus.OK;
  }

  @Get('/google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Ip() ip: any,
    @Req() req: any,
    @Res() response: any,
  ) {
    try {
      const userData = await this.authService.googleLogin(req, ip, 'googleId');

      if (userData && !hasUserAgent(req).mobile) {
        response.send(
          `<script>window.opener.postMessage('${JSON.stringify(
            userData,
          )}', '*');window.close()</script>`,
        );
      }

      // for mobile
      return userData;
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
    @Res() response: any,
  ) {
    try {
      const userData = await this.authService.facebookLogin(req, ip, 'facebookId');

      if (userData && !hasUserAgent(req).mobile) {
        response.send(
          `<script>window.opener.postMessage('${JSON.stringify(
            userData,
          )}', '*');window.close()</script>`,
        );
      }

      // for mobile
      return userData;
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
    @Res() response: any,
  ) {
    try {
      const userData = await this.authService.vkontakteLogin(req, ip, 'vkontakteId');

      if (userData && !hasUserAgent(req).mobile) {
        response.send(
          `<script>window.opener.postMessage('${JSON.stringify(
            userData,
          )}', '*');window.close()</script>`,
        );
      }

      // for mobile
      return userData;
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
    @Res() response: any,
  ) {
    try {
      const userData = await this.authService.odnoklassnikiLogin(req, ip, 'odnoklassnikiId');

      if (userData && !hasUserAgent(req).mobile) {
        response.send(
          `<script>window.opener.postMessage('${JSON.stringify(
            userData,
          )}', '*');window.close()</script>`,
        );
      }

      // for mobile
      return userData;
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
    @Res() response: any,
  ) {
    try {
      const userData = await this.authService.mailruLogin(req, ip, 'mailruId');

      if (userData && !hasUserAgent(req).mobile) {
        response.send(
          `<script>window.opener.postMessage('${JSON.stringify(
            userData,
          )}', '*');window.close()</script>`,
        );
      }

      // for mobile
      return userData;
    } catch (error) {
      console.log('/mailru/redirect controller error', error?.message);
    }
  }

  // @ApiOperation({ summary: 'Выход из приложения' })
  // @ApiResponse({ status: 200 })
  @Post('/logout')
  async logout(
    @Session() session: Record<string, any>,
    @Cookies('token') refreshtoken: string,
    @Res({ passthrough: true }) response: any,
  ) {
    try {
      const token = await this.authService.logout(refreshtoken);
      session.destroy(err => {
        console.log(err);
        return false;
      });
      response.clearCookie('sid');
      response.clearCookie('token');
      return token;
    } catch (error) {
      console.log(error);
    }
  }
}
