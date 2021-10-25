import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { UserEntity } from '../users/entity';
import { OTPEntity, RefreshTokenSessionsEntity } from './entity';
import { RoleEntity, UserRolesEntity } from '../roles/entity';
import {
  FacebookStrategy,
  GoogleStrategy,
  // VkontakteStrategy,
  // OdnoklassnikiStrategy,
  // MailruStrategy,
  LocalStrategy,
  JwtStrategy,
} from './strategies';
import { RoleService } from '../roles/roles.service';
import { MailService } from '../mail/mail.service';
import { PassportModule } from '@nestjs/passport';
import { RolesModule } from '../roles/roles.module';
import { PhoneService } from '../phone/phone.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    FacebookStrategy,
    // VkontakteStrategy,
    // OdnoklassnikiStrategy,
    // MailruStrategy,
    PhoneService,
    RoleService,
    MailService,
    LocalStrategy,
    JwtStrategy,
  ],
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'SERCRET',
      signOptions: {
        expiresIn: '10m',
      },
    }),
    TypeOrmModule.forFeature([
      RefreshTokenSessionsEntity,
      UserEntity,
      UserRolesEntity,
      RoleEntity,
      OTPEntity,
    ]),
    RolesModule,
    forwardRef(() => UsersModule),
  ],
  exports: [
    AuthService,
    JwtModule,
    // LocalStrategy
  ],
})
export class AuthModule {}
