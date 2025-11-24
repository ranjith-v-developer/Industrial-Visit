import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendMail(mailData) {
    const mailOptions: ISendMailOptions = {
      to: mailData.to,
      text: mailData.text,
      subject: mailData.subject,
    };
    if (mailData.html) {
      mailOptions.html = mailData.html;
    }
    if (mailData.cc?.length > 0) {
      mailOptions.cc = mailData.cc;
    }
    return this.mailerService.sendMail(mailOptions);
  }
}
