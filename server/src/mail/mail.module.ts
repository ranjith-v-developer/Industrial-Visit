import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from '../mail/mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const options = configService.get('email');
        return options;
      },
    }),
  ],
  providers: [MailService, ConfigService],
  controllers: [],
  exports: [MailService],
})
export class MailModule {}
