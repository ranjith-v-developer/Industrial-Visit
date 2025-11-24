import { forwardRef, Module } from '@nestjs/common';
import { IndInsService } from './ind-ins.service';
import { IndInsController } from './ind-ins.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndInsEntity } from './entities/ind-ins.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/users/users.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IndInsEntity]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => MailModule),
  ],
  controllers: [IndInsController],
  providers: [IndInsService],
  exports: [IndInsService],
})
export class IndInsModule {}
