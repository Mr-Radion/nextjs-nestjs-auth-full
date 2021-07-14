import { forwardRef, Module } from '@nestjs/common';
// import { AuthModule } from '../auth/auth.module';
// import { RolesModule } from '../roles/roles.module';
// import { UsersController } from './users.controller';
// import { UsersService } from './users.service';
// import { MailModule } from '../mail/mail.module';

@Module({
  // controllers: [UsersController],
  // providers: [UsersService],
  imports: [
    // RolesModule,
    // forwardRef(() => AuthModule),
    // MailModule,
  ],
  // exports: [UsersService],
})
export class UsersModule {}
