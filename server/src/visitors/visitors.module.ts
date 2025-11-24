import { forwardRef, Module } from '@nestjs/common';
import { VisitorsService } from './visitors.service';
import { VisitorsController } from './visitors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from 'src/mail/mail.module';
import { UserModule } from 'src/users/users.module';
import { VisitorEntity } from './entities/visitor.entity';
import { IndustrialVisitModule } from 'src/industrial-visit/industrial-visit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VisitorEntity]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => MailModule),
    forwardRef(() => IndustrialVisitModule),
  ],
  controllers: [VisitorsController],
  providers: [VisitorsService],
  exports: [VisitorsService],
})
export class VisitorsModule {}
