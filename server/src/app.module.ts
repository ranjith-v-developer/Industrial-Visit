import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/users.module';
import { IndInsModule } from './ind-ins/ind-ins.module';
import { MailModule } from './mail/mail.module';
import { IndustrialVisitModule } from './industrial-visit/industrial-visit.module';
import { VisitorsModule } from './visitors/visitors.module';
import { PredictModule } from './predict/predict.module';
import { VoiceRecognizeModule } from './voice-recognize/voice-recognize.module';
import { ChartModule } from './chart/chart.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development',
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const options = configService.get('database');
        options.name = 'default';
        options.entities = [__dirname + '/**/*.entity{.ts,.js}'];
        return options;
      },
    }),
    UserModule,
    IndInsModule,
    AuthModule,
    MailModule,
    IndustrialVisitModule,
    VisitorsModule,
    PredictModule,
    VoiceRecognizeModule,
    ChartModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
