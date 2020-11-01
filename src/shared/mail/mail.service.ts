import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private readonly configService: ConfigService) {}

  async sendEmail(mailOptions: any): Promise<boolean> {
    const transporter = this.createNodeMailerTransport();
    return new Promise<boolean>(async function(resolve, reject) {
      return transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          console.log('Message sent: %s', error);
          return reject(false);
        }
        console.log('Message sent: %s', info.messageId);
        resolve(true);
      });
    });
  }

  createNodeMailerTransport() {
    return nodemailer.createTransport({
      host: this.configService.get('mail.host'),
      port: this.configService.get<number>('mail.port'),
      secure: this.configService.get<boolean>('mail.secure'),
      auth: {
        user: this.configService.get('mail.user'),
        pass: this.configService.get('mail.password'),
      },
      tls: {
        rejectUnauthorized: true,
      },
    });
  }
}
