import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// own implementation, to validate the login and password during authorization using PassportStrategy

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
