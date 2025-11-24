import { forwardRef, Module } from '@nestjs/common';
import { IndustrialVisitService } from './industrial-visit.service';
import { IndustrialVisitController } from './industrial-visit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndustrialVisitEntity } from './entities/industrial-visit.entity';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from 'src/mail/mail.module';
import { UserModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IndustrialVisitEntity]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => MailModule),
  ],
  controllers: [IndustrialVisitController],
  providers: [IndustrialVisitService],
  exports: [IndustrialVisitService],
})
export class IndustrialVisitModule {}
