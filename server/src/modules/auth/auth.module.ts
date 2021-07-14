import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
// import { User, UserSchema } from '../users/schemas';
// import { RefreshTokenSessions, RefreshTokenSessionsSchema } from './schemas';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'SERCRET',
      signOptions: {
        expiresIn: '30m',
      },
    }),
    // MongooseModule.forFeature([
    //   { name: User.name, schema: UserSchema },
    //   { name: RefreshTokenSessions.name, schema: RefreshTokenSessionsSchema },
    // ]),
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
