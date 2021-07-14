import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}
  async sendActivationMail(toEmail, link): Promise<void> {
    try {
      this.mailerService.sendMail({
        to: toEmail, // list of receivers
        from: process.env.SMTP_USER, // sender address
        subject: `Активация аккаунта на ${process.env.API_URL} ✔`, // Subject of the email
        text: '', // plaintext body
        html: `
                <div>
                  <h1>Для активации перейдите по ссылке</h1>
                  <a href="${link}">${link}</a>
                </div>
              `,
      });
    } catch (error) {
      console.log(error, 22);
    }
  }
}
