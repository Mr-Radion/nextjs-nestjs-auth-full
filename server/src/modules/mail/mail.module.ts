import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  providers: [MailService],
  controllers: [MailController],
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          secure: process.env.NODE_ENV !== 'development',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        },
      }),
    }),
  ],
  exports: [MailService],
})
export class MailModule {}
