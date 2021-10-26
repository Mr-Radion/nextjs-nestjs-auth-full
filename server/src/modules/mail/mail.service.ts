import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}
  async sendActivationMail(toEmail: string, link: string, generatedPassword?: any): Promise<void> {
    try {
      this.mailerService.sendMail({
        to: toEmail, // list of receivers
        from: process.env.SMTP_USER, // sender address
        subject: `Активация аккаунта на ${process.env.API_URL} ✔`, // Subject of the email
        text: '', // plaintext body
        html: `
                <div>
                  ${
                    generatedPassword
                      ? `<div><p>Ваш логин: ${toEmail}</p><p>Ваш пароль: ${generatedPassword}</p><div>`
                      : ''
                  }
                  <h1>Для активации перейдите по ссылке</h1>
                  <a href="${link}">${link}</a>
                </div>
              `,
      });
    } catch (error) {
      console.log('Ошибка при отправки почты: ', error.message);
      return error;
    }
  }

  async sendMailCode(toEmail: string, otpCOde: string) {
    try {
      // добавить одноразовую ссылку для мгновенной авторизации, которая будет передавать код запросом при нажатии с кодом, мылом и отпечатком браузера,
      // это может быть кнопка с надписью войти сразу, при этом сохранять токен в куки и как следствие также устаревать, с ссылкой на главну, которая
      // в случае неавторизованного может редиректнуть на форму входа
      this.mailerService.sendMail({
        to: toEmail, // list of receivers
        from: process.env.SMTP_USER, // sender address
        subject: `Код подтверждения`, // Subject of the email
        text: '', // plaintext body
        html: `
                <div>
                  ${`<div><<p>${otpCOde} — ваш код для авторизации на ${process.env.API_URL} ✔ </p><div>`}
                </div>
              `,
      });
    } catch (error) {
      console.log('Ошибка при отправки почты: ', error.message);
      return error;
    }
  }

  async sendMailPasswordCreation(toEmail: string, link: string) {
    this.mailerService.sendMail({
      to: toEmail,
      from: process.env.SMTP_USER,
      subject: `Создание нового пароля для аккаунта на ${process.env.API_URL} ✔`,
      text: '',
      html: `
      <div>
        ${`<div><p>Перейдите по ссылке для изменения пароля: ${link}</p><div>`}
      </div>
    `,
    });
  }
}
