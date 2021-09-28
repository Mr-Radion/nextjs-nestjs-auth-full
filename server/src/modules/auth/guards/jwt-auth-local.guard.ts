import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// own implementation, to check the validity of a token using PassportStrategy

@Injectable()
export class LocalJwtAuthGuard extends AuthGuard('jwt') {}
