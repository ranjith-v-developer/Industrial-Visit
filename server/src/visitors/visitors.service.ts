import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailService } from 'src/mail/mail.service';
import { VisitorEntity } from './entities/visitor.entity';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { VisitorRO } from './interfaces/visitors.interface';
import { UserRO } from 'src/users/interfaces/user.interface';
import { IndustrialVisitService } from 'src/industrial-visit/industrial-visit.service';

const ivSubmittedEmailText = ({ firstName, lastName, ivData }) =>
  `
    Hello, ${firstName} ${lastName}.

    You have submitted the industrial visit ${ivData.name}.

    Thanks,
    Mobtechi
  `;

const visitorRegEmailText = ({ visitorName, ivData, userName }) =>
  `
    Hello, ${visitorName}.

    You have registered with ${ivData.name} by ${userName}.

    Thanks,
    Mobtechi
  `;

const visitorFeedbackRequestEmailHTML = ({ visitor, ivData }) =>
  `
    <h2>Hello, ${visitor.name}<h2>

    <p>Please share you feedback of <a href="http://localhost:4200/industry/iv/${ivData.id}/visitor/${visitor.id}" target="_blank">${ivData.name}</a><p>

    Thanks,
    Mobtechi
  `;

@Injectable()
export class VisitorsService {
  constructor(
    @InjectRepository(VisitorEntity)
    private readonly visitorRepository: Repository<VisitorEntity>,
    private mailService: MailService,
    private industrialVisitService: IndustrialVisitService,
  ) {}

  async create(createVisitorDto: CreateVisitorDto[], user: UserRO) {
    if (!Array.isArray(createVisitorDto)) {
      throw new HttpException(
        { message: 'payload must be an array' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const emptyRegIds = createVisitorDto.filter(
      (visitor) => visitor.reg_id === null,
    );
    if (emptyRegIds.length > 0) {
      throw new HttpException(
        { message: 'register id must be required' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const emptyEmail = createVisitorDto.filter(
      (visitor) => visitor.email === null,
    );
    if (emptyEmail.length > 0) {
      throw new HttpException(
        { message: 'email must be required' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const visitorsToSave = await Promise.all(
      createVisitorDto.map(async (visitor) => {
        const {
          name,
          industrialVisit: { id: industrialVisitId },
          ...rest
        } = visitor;

        const existingVisitor = await this.visitorRepository
          .createQueryBuilder('visitor')
          .where(
            'LOWER(visitor.name) = LOWER(:name) AND visitor.industrialVisitId = :industrialVisitId',
            { name, industrialVisitId },
          )
          .getOne();

        if (existingVisitor) {
          const errors = {
            industrialVisit: `This visitor ${existingVisitor.name} ${existingVisitor.reg_id} already exists in this industrial visit.`,
          };
          throw new HttpException(
            { message: 'Input data validation failed', errors },
            HttpStatus.BAD_REQUEST,
          );
        }

        const newVisitor = new VisitorEntity();
        Object.assign(newVisitor, rest, {
          name,
          industrialVisit: visitor.industrialVisit,
        });
        return newVisitor;
      }),
    );

    const savedData = await this.visitorRepository.save(visitorsToSave);
    const getIvDetails = await this.industrialVisitService.findById(
      savedData[0].industrialVisit.id,
    );

    // Send email notification to visitors
    await Promise.all(
      visitorsToSave.map(async (visitor) => {
        const mailData = {
          to: visitor.email,
          subject: `You have registered the new industrial visit`,
          text: visitorRegEmailText({
            visitorName: visitor.name,
            ivData: getIvDetails,
            userName: `${user.firstName} ${user.lastName}`,
          }),
        };
        await this.mailService.sendMail(mailData);
      }),
    );

    // Send email notification
    const mailData = {
      to: user.email,
      subject: `Submitted the industrial visit`,
      text: ivSubmittedEmailText({
        firstName: user.firstName,
        lastName: user.lastName,
        ivData: getIvDetails,
      }),
    };
    await this.mailService.sendMail(mailData);
    return savedData.map((d) => this.buildVisitorRO(d));
  }

  async findAll(offset: number = 0, limit: number = 15, filters: any = {}) {
    const [sortField, sortOrder] =
      filters.sort.split('@') || 'createdAt@DESC'.split('@');

    const qb = this.visitorRepository
      .createQueryBuilder('visitor')
      .skip(offset)
      .take(limit)
      .orderBy(`visitor.${sortField}`, sortOrder);

    if (filters?.searchText?.length > 0) {
      qb.andWhere(
        '(visitor.email ilike :searchText) || (visitor.name ilike :searchText)',
        {
          searchText: `%${filters?.searchText}%`,
        },
      );
    }

    const lists: any[] = await qb.getMany();
    return lists.map((list) => this.buildVisitorRO(list));
  }

  async findById(id: string): Promise<VisitorRO> {
    const industrialVisitData = await this.visitorRepository.findOne({
      where: { id },
    });
    if (!industrialVisitData) {
      return null;
    }
    return this.buildVisitorRO(industrialVisitData);
  }

  async update(
    id: string,
    updateVisitorDto: UpdateVisitorDto,
  ): Promise<VisitorEntity> {
    const toUpdate = await this.visitorRepository.findOne({
      where: { id },
    });
    const update = Object.assign(toUpdate, updateVisitorDto);
    const updatedData = await this.visitorRepository.save(update);
    return updatedData;
  }

  async updateMultiple(
    updateVisitorDto: UpdateVisitorDto[],
  ): Promise<VisitorEntity[]> {
    const visitorsToUpdtae = await Promise.all(
      updateVisitorDto.map(async (visitor) => {
        const toUpdate = await this.visitorRepository.findOne({
          where: { id: visitor.id },
        });
        const update = Object.assign(toUpdate, visitor);
        return update;
      }),
    );
    const updatedData = await this.visitorRepository.save(visitorsToUpdtae);
    return updatedData.map((d) => this.buildVisitorRO(d));
  }

  async delete(id: string) {
    return await this.visitorRepository.delete({ id });
  }

  async feedbackNotification(visitorId: string) {
    const visitor = await this.visitorRepository.findOne({
      where: { id: visitorId },
      relations: ['industrialVisit'],
    });
    const getIvDetails = await this.industrialVisitService.findById(
      visitor.industrialVisit.id,
    );
    // Send email notification to visitors
    const mailData = {
      to: visitor.email,
      subject: `Share your Feedback about ${getIvDetails.name}`,
      html: visitorFeedbackRequestEmailHTML({ visitor, ivData: getIvDetails }),
    };
    await this.mailService.sendMail(mailData);
  }

  async sentFeedback(visitorId: string, feedbackData: any) {
    const toUpdate = await this.visitorRepository.findOne({
      where: { id: visitorId },
    });
    if (!toUpdate) {
      throw new NotFoundException(`Visitor with ID ${visitorId} not found`);
    }
    const update = Object.assign(toUpdate, feedbackData);
    await this.visitorRepository.save(update);
    return { success: true };
  }

  private buildVisitorRO(visitorData: VisitorEntity) {
    if (!visitorData) {
      return undefined;
    }
    const industrialVisitData: VisitorEntity = {
      id: visitorData.id,
      name: visitorData.name,
      type: visitorData.type,
      reg_id: visitorData.reg_id,
      email: visitorData.email,
      contact_no: visitorData.contact_no,
      dept: visitorData.dept,
      industrialVisit: visitorData.industrialVisit,
      institute: visitorData.institute,
      attend: visitorData.attend,
      allowToFeedback: visitorData.allowToFeedback,
      rating: visitorData.rating,
      comments: visitorData.comments,
    };
    return industrialVisitData;
  }
}
