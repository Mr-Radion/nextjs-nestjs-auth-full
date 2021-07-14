import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role, RoleSchema } from './schemas';
import { AuthModule } from '../auth/auth.module';

@Module({
  providers: [RoleService],
  controllers: [RolesController],
  imports: [MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]), AuthModule],
  exports: [RoleService],
})
export class RolesModule {}
