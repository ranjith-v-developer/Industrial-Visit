import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateIndInsDto } from './dto/create-ind-ins.dto';
import { UpdateIndInsDto } from './dto/update-ind-ins.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndInsEntity } from './entities/ind-ins.entity';
import { IndInsRO } from './interfaces/ind-ins.interface';
import { MailService } from 'src/mail/mail.service';

const createIndInsEmailText = ({ firstName, lastName, IndInsData }) =>
  `
    Hello, ${firstName} ${lastName ? lastName : ''}.

    We will update ${IndInsData.type === 'institute' ? 'institute' : 'industry'} name as ${IndInsData.name} within 24hrs.

    Thanks,
    Mobtechi
  `;

const simpleEmailText = ({ text }) =>
  `
    Hello

    ${text}.

    Thanks,
    Mobtechi
  `;

@Injectable()
export class IndInsService {
  constructor(
    @InjectRepository(IndInsEntity)
    private readonly indInsRepository: Repository<IndInsEntity>,
    private mailService: MailService,
  ) {}

  async create(createIndInsDto: CreateIndInsDto) {
    const { email } = createIndInsDto;
    if (!email) {
      throw new HttpException(
        { message: 'email must be required' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const qb = await this.indInsRepository
      .createQueryBuilder('ind_ins')
      .where(
        "LOWER(ind_ins.email) = LOWER(:email) AND ind_ins.status != 'rejected'",
        { email },
      );
    const getIndIns = await qb.getOne();
    if (getIndIns) {
      const errors = { email: 'email must be unique.' };
      throw new HttpException(
        { message: 'Input data validation failed', errors },
        HttpStatus.BAD_REQUEST,
      );
    }

    // create new college / Organization
    const newData = new IndInsEntity();
    newData.name = createIndInsDto.name;
    newData.email = createIndInsDto.email.toLowerCase();
    newData.description = createIndInsDto.description;
    newData.website = createIndInsDto.website;
    newData.city = createIndInsDto.city;
    newData.state = createIndInsDto.state;
    newData.district = createIndInsDto.district;
    newData.type = createIndInsDto.type;
    newData.ph_no = createIndInsDto.ph_no;
    newData.pincode = createIndInsDto.pincode;
    newData.status = createIndInsDto.status;
    newData.comments = createIndInsDto.comments;
    newData.reporterEmail = createIndInsDto.reporterEmail;

    const savedIndIns = await this.indInsRepository.save(newData);
    const mailData = {
      to: savedIndIns.reporterEmail,
      text: createIndInsEmailText({
        firstName: '',
        lastName: '',
        IndInsData: savedIndIns,
      }),
      subject: `Add ${savedIndIns.type === 'institute' ? 'institute' : 'industry'} request`,
    };
    await this.mailService.sendMail(mailData);
    return this.buildIndInsRO(savedIndIns);
  }

  async createBulk(
    createIndInsDto: CreateIndInsDto[],
    allowUpdate: boolean = false,
  ) {
    const batchContainer: {
      batchNo: number;
      batchElements: CreateIndInsDto[];
    }[] = [];
    const batchSize = 300;
    let currentIndex = 0;
    let batchNo = 0;
    let currentBatch: { batchNo: number; batchElements: CreateIndInsDto[] } = {
      batchNo: batchNo,
      batchElements: [],
    };

    createIndInsDto.forEach((rowDto) => {
      currentIndex++;
      currentBatch.batchElements.push(rowDto);
      if (currentIndex % batchSize == 0) {
        batchContainer.push(currentBatch);
        batchNo++;
        currentBatch = { batchNo: batchNo, batchElements: [] };
      }
    });
    if (currentBatch && currentBatch.batchElements.length > 0) {
      batchContainer.push(currentBatch);
    }

    for (let index = 0; index < batchContainer.length; index++) {
      const batchElements = batchContainer[index].batchElements;

      const indInsList: IndInsEntity[] = await Promise.all(
        batchElements.map(async (createIndInsDto) => {
          const { email } = createIndInsDto;
          const qb = await this.indInsRepository
            .createQueryBuilder('ind_ins')
            .where('LOWER(ind_ins.email) = LOWER(:email)', { email });
          const getIndIns = await qb.getOne();

          if (getIndIns && !allowUpdate) {
            const errors = { email: 'Email must be unique.' };
            throw new HttpException(
              { message: 'Input data validation failed', errors },
              HttpStatus.BAD_REQUEST,
            );
          }

          // create new institue / industrial
          let newData;
          if (getIndIns) {
            newData = getIndIns;
          } else {
            newData = new IndInsEntity();
          }
          newData.name = createIndInsDto.name;
          newData.email = createIndInsDto.email.toLowerCase();
          newData.description = createIndInsDto.description;
          newData.city = createIndInsDto.city;
          newData.state = createIndInsDto.state;
          newData.district = createIndInsDto.district;
          newData.type = createIndInsDto.type;
          newData.ph_no = createIndInsDto.ph_no;
          newData.pincode = createIndInsDto.pincode;
          newData.status = createIndInsDto.status;
          newData.website = createIndInsDto.website;
          return newData;
        }),
      );

      await this.indInsRepository.save(indInsList);
      console.log(
        'batch save',
        `Saved batch ${index} records from ${index * batchSize} to ${index * batchSize + batchElements.length}`,
      );
    }
    return;
  }

  async findAll(offset: number = 0, limit: number = 15, filters: any = {}) {
    const [sortField, sortOrder] =
      filters.sort.split('@') || 'created_at@ASC'.split('@');

    const qb = this.indInsRepository
      .createQueryBuilder('ind_ins')
      .skip(offset)
      .take(limit);

    qb.orderBy(sortField, sortOrder);

    if (filters?.searchText?.length > 0) {
      qb.andWhere('(ind_ins.name ilike :searchText)', {
        searchText: `%${filters?.searchText}%`,
      });
    }

    if (filters?.status) {
      qb.andWhere('(ind_ins.status = :status)', {
        status: filters?.status,
      });
    }

    const lists: IndInsEntity[] = await qb.getMany();
    return lists.map((list) => this.buildIndInsRO(list));
  }

  async findCount(filters: any = {}) {
    const qb = this.indInsRepository.createQueryBuilder('ind_ins');

    if (filters?.status) {
      qb.andWhere('(ind_ins.status = :status)', {
        status: filters?.status,
      });
    }

    const getCount: number = await qb.getCount();
    return {
      count: getCount,
    };
  }

  async findById(id: string): Promise<IndInsRO> {
    const indInsData = await this.indInsRepository.findOne({ where: { id } });
    if (!indInsData) {
      return null;
    }
    return this.buildIndInsRO(indInsData);
  }

  async update(
    id: string,
    updateIndInsDto: UpdateIndInsDto,
    isVerification: boolean = false,
  ): Promise<IndInsEntity> {
    const toUpdate = await this.indInsRepository.findOne({ where: { id } });
    const update = Object.assign(toUpdate, updateIndInsDto);
    const fetchReporterEmail = update.reporterEmail;
    if (isVerification) {
      update.reporterEmail = null;
    }
    const updatedData = await this.indInsRepository.save(update);
    let setMailText = '';
    let setMailSubject = '';
    switch (updateIndInsDto.status) {
      case 'approved':
        setMailText = `Our team verified ${updatedData.type === 'institute' ? 'institute' : 'industry'} ${updatedData.name}. Please check now.`;
        setMailSubject = `Added ${updatedData.type === 'institute' ? 'institute' : 'industry'}`;
        break;
      case 'rejected':
        setMailText = `Our team rejected ${updatedData.type === 'institute' ? 'institute' : 'industry'} ${updatedData.name}.`;
        setMailSubject = `Rejected ${updatedData.type === 'institute' ? 'institute' : 'industry'}`;
        break;
      default:
        break;
    }
    const mailData = {
      to: fetchReporterEmail,
      text: simpleEmailText({ text: setMailText }),
      subject: setMailSubject,
    };
    if (isVerification) {
      await this.mailService.sendMail(mailData);
    }
    return updatedData;
  }

  async delete(id: string) {
    return await this.indInsRepository.delete({ id });
  }

  private buildIndInsRO(indIns: IndInsEntity) {
    if (!indIns) {
      return undefined;
    }
    const indInsRO_data: IndInsRO = {
      id: indIns.id,
      name: indIns.name,
      description: indIns.description,
      email: indIns.email,
      website: indIns.website,
      city: indIns.city,
      district: indIns.district,
      state: indIns.state,
      ph_no: indIns.ph_no,
      pincode: indIns.pincode,
      type: indIns.type,
      comments: indIns.comments,
      status: indIns.status,
      reporterEmail: indIns.reporterEmail,
    };
    return indInsRO_data;
  }
}
