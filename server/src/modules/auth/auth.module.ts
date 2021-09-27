import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
// import { PassportModule } from '@nestjs/passport';
import { UserEntity } from '../users/entity';
import { RefreshTokenSessionsEntity } from './entity';
import { RoleEntity, UserRolesEntity } from '../roles/entity';
import { GoogleStrategy } from './google.strategy';
import { FacebookStrategy } from './facebook.strategy';
// import { RolesModule } from '../roles/roles.module';
import { RoleService } from '../roles/roles.service';
import { MailService } from '../mail/mail.service';
// import { LocalStrategy } from './local.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, FacebookStrategy, RoleService, MailService],
  imports: [
    forwardRef(() => UsersModule),
    // PassportModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'SERCRET',
      signOptions: {
        expiresIn: '30m',
      },
    }),
    TypeOrmModule.forFeature([RefreshTokenSessionsEntity, UserEntity, UserRolesEntity, RoleEntity]),
  ],
  exports: [
    AuthService, 
    JwtModule, 
    // LocalStrategy
  ],
})
export class AuthModule {}
