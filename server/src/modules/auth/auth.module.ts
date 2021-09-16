import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { UserEntity } from '../users/entity';
import { RefreshTokenSessionsEntity } from './entity';
import { UserRolesEntity } from '../roles/entity';

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
    TypeOrmModule.forFeature([RefreshTokenSessionsEntity, UserEntity, UserRolesEntity]),
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
