import { Module } from '@nestjs/common';
import { PhoneService } from './phone.service';
import { PhoneController } from './phone.controller';
import { TwilioModule } from 'nestjs-twilio';

@Module({
  providers: [PhoneService],
  controllers: [PhoneController],
  imports: [
    TwilioModule.forRootAsync({
      useFactory: async () => ({
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
      }),
    }),
  ],
  exports: [PhoneService],
})
export class PhoneModule {}
