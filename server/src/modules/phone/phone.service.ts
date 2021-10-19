import { Injectable } from '@nestjs/common';
import { InjectTwilio, TwilioClient } from 'nestjs-twilio';

@Injectable()
export class PhoneService {
  constructor(@InjectTwilio() private readonly client: TwilioClient) {}
  async sendPhoneSMS(TARGET_PHONE_NUMBER: string) {
    try {
      return await this.client.messages.create({
        body: `SMS Body, sent to the phone! ${TARGET_PHONE_NUMBER}`,
        from: process.env.TWILIO_PHONE_NUMBER, // format +14177544075
        to: '+' + TARGET_PHONE_NUMBER,
      });
    } catch (e) {
      console.log(e?.message);
      return e;
    }
  }

  // we receive a phone number from the user, to which we need to send the code and method via SMS or call
  async login(TARGET_PHONE_NUMBER: string, channel?: string) {
    try {
      console.log({ TARGET_PHONE_NUMBER, channel }, 1);
      return this.client.verify.services(process.env.TWILIO_SERVICE_SID).verifications.create({
        to: `+${TARGET_PHONE_NUMBER}`,
        channel: channel === 'call' ? 'call' : 'sms',
      });
    } catch (e) {
      console.log(e?.message);
      return e;
    }
  }

  // we receive a code and a phone number from the user in order to verify the correctness and verify the user
  async verify(TARGET_PHONE_NUMBER: string, code: string) {
    try {
      console.log({ TARGET_PHONE_NUMBER, code }, 2);
      return this.client.verify.services(process.env.TWILIO_SERVICE_SID).verificationChecks.create({
        to: `+${TARGET_PHONE_NUMBER}`,
        code: code, // the default expiration date is 10 minutes
      });
    } catch (e) {
      console.log(e?.message);
      return e;
    }
  }
}
