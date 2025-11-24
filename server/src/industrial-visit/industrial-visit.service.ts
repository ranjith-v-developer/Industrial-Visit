import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateIndustrialVisitDto } from './dto/create-industrial-visit.dto';
import { UpdateIndustrialVisitDto } from './dto/update-industrial-visit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IndustrialVisitEntity } from './entities/industrial-visit.entity';
import { Repository } from 'typeorm';
import { MailService } from 'src/mail/mail.service';
import { IndustrialVisitRO } from './interfaces/industrial-visit.interface';
import { UserRO } from 'src/users/interfaces/user.interface';

const createIVEmailText = ({ firstName, lastName, IVData }) =>
  `
    Hello, ${firstName} ${lastName ? lastName : ''}.

    You have created a new industrial visit ${IVData.name}.

    Thanks,
    Mobtechi
  `;

const updateIVEmailText = ({ firstName, lastName, IVData, industrial, type }) =>
  `
    Hello, ${firstName} ${lastName ? lastName : ''}.

    ${industrial.name} increased the ${IVData.name} ${type} members count. If you want to add members please do it.

    Thanks,
    Mobtechi
  `;

@Injectable()
export class IndustrialVisitService {
  constructor(
    @InjectRepository(IndustrialVisitEntity)
    private readonly industrialVisitRepository: Repository<IndustrialVisitEntity>,
    private mailService: MailService,
  ) {}

  async create(
    createIndustrialVisitDto: CreateIndustrialVisitDto,
    user: UserRO,
  ) {
    const { name } = createIndustrialVisitDto;
    if (!name) {
      throw new HttpException(
        { message: 'industrial visit name must be required' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const qb = await this.industrialVisitRepository
      .createQueryBuilder('industrial_visit')
      .where('LOWER(industrial_visit.name) = LOWER(:name)', { name });
    const getIndustrialVisit = await qb.getOne();
    if (getIndustrialVisit) {
      const errors = { name: 'This industrial visit already exists.' };
      throw new HttpException(
        { message: 'Input data validation failed', errors },
        HttpStatus.BAD_REQUEST,
      );
    }

    // create new IV
    const newData = new IndustrialVisitEntity();
    newData.name = createIndustrialVisitDto.name;
    newData.description = createIndustrialVisitDto.description;
    newData.course_and_dept = createIndustrialVisitDto.course_and_dept;
    newData.no_of_students = createIndustrialVisitDto.no_of_students;
    newData.no_of_faculty = createIndustrialVisitDto.no_of_faculty;
    newData.contact_person = createIndustrialVisitDto.contact_person;
    newData.contact_no = createIndustrialVisitDto.contact_no;
    newData.alternative_contact_no =
      createIndustrialVisitDto.alternative_contact_no;
    newData.food_provide = createIndustrialVisitDto.food_provide;
    newData.available_institute = createIndustrialVisitDto.available_institute;
    newData.start_date = createIndustrialVisitDto.start_date;
    newData.end_date = createIndustrialVisitDto.end_date;
    newData.industry = createIndustrialVisitDto.industry;
    newData.location = createIndustrialVisitDto.location;

    const savedData = await this.industrialVisitRepository.save(newData);
    const mailData = {
      to: user.email,
      subject: `Created new industrial visit`,
      text: createIVEmailText({
        firstName: user.firstName,
        lastName: user.lastName,
        IVData: savedData,
      }),
    };
    await this.mailService.sendMail(mailData);
    return this.buildIndustrialVisitDataRO(savedData);
  }

  async findAll(offset: number = 0, limit: number = 15, filters: any = {}) {
    const [sortField, sortOrder] =
      filters?.sort?.split('@') || 'createdAt@DESC'.split('@');

    const qb = this.industrialVisitRepository
      .createQueryBuilder('industrial_visit')
      .leftJoinAndSelect('industrial_visit.visitors', 'visitor') // Use 'visitor' as alias
      .leftJoinAndSelect('visitor.institute', 'ind_ins')
      .leftJoinAndSelect('industrial_visit.industry', 'industry')
      .skip(offset)
      .take(limit)
      .orderBy(`industrial_visit.${sortField}`, sortOrder);

    if (filters?.searchText?.length > 0) {
      qb.andWhere('(industrial_visit.name ilike :searchText)', {
        searchText: `%${filters?.searchText}%`,
      });
    }

    if (filters?.industry) {
      qb.andWhere('(industrial_visit.industryId = :industryId)', {
        industryId: filters.industry,
      });
    }

    if (filters?.institute) {
      qb.andWhere('(ind_ins.id = :instituteId)', {
        instituteId: filters.institute,
      });
    }

    if (filters?.course_and_dept) {
      qb.andWhere('(industrial_visit.course_and_dept ilike :course_and_dept)', {
        course_and_dept: `%${filters?.course_and_dept}%`,
      });
    }

    if (filters?.location) {
      qb.andWhere('(industrial_visit.location ilike :location)', {
        location: `%${filters?.location}%`,
      });
    }

    const lists: any[] = await qb.getMany();
    const buildData = lists.map((dt) => {
      // form the institute with visitors
      const instituteWithVisitors = [];
      dt.visitors?.forEach((visitor) => {
        const getInstituteId = instituteWithVisitors.findIndex(
          (ins) => ins.id === visitor.institute.id,
        );
        if (getInstituteId > -1) {
          delete visitor.institute;
          instituteWithVisitors[getInstituteId] = {
            ...instituteWithVisitors[getInstituteId],
            visitors: [
              ...instituteWithVisitors[getInstituteId].visitors,
              visitor,
            ],
          };
        } else {
          const vis = JSON.parse(JSON.stringify(visitor));
          delete vis.institute;
          instituteWithVisitors.push({
            ...visitor.institute,
            visitors: [vis],
          });
        }
        return instituteWithVisitors;
      });
      const result = {
        ...this.buildIndustrialVisitDataRO(dt),
        instituteData: instituteWithVisitors,
      };
      delete result.visitors;
      return result;
    });
    return buildData;
  }

  async findById(id: string): Promise<IndustrialVisitRO> {
    const industrialVisitData: any =
      await this.industrialVisitRepository.findOne({
        where: { id },
        relations: ['visitors', 'visitors.institute', 'industry'],
      });
    if (!industrialVisitData) {
      return null;
    }
    // form the institute with visitors
    const instituteWithVisitors = [];
    industrialVisitData.visitors?.forEach((visitor) => {
      const getInstituteId = instituteWithVisitors.findIndex(
        (ins) => ins.id === visitor.institute.id,
      );
      if (getInstituteId > -1) {
        delete visitor.institute;
        instituteWithVisitors[getInstituteId] = {
          ...instituteWithVisitors[getInstituteId],
          visitors: [
            ...instituteWithVisitors[getInstituteId].visitors,
            visitor,
          ],
        };
      } else {
        const vis = JSON.parse(JSON.stringify(visitor));
        delete vis.institute;
        instituteWithVisitors.push({
          ...visitor.institute,
          visitors: [vis],
        });
      }
      return instituteWithVisitors;
    });

    const result = {
      ...this.buildIndustrialVisitDataRO(industrialVisitData),
      instituteData: instituteWithVisitors,
    };
    delete result.visitors;
    return result;
  }

  async update(
    id: string,
    updateIndustrialVisitDto: UpdateIndustrialVisitDto,
  ): Promise<IndustrialVisitEntity> {
    const toUpdate = await this.industrialVisitRepository.findOne({
      where: { id },
      relations: ['visitors'],
    });
    if (toUpdate.visitors.length > 0) {
      if (updateIndustrialVisitDto.no_of_students < toUpdate.no_of_students) {
        throw new HttpException(
          { message: 'Bad Request, You cannot decrease the no.of students' },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (updateIndustrialVisitDto.no_of_faculty < toUpdate.no_of_faculty) {
        throw new HttpException(
          { message: 'Bad Request, You cannot decrease the no.of faculty' },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (
        updateIndustrialVisitDto.available_institute <
        toUpdate.available_institute
      ) {
        throw new HttpException(
          {
            message: 'Bad Request, You cannot decrease the available institute',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    delete updateIndustrialVisitDto.visitors;
    const update = Object.assign(toUpdate, updateIndustrialVisitDto);
    const updatedData = await this.industrialVisitRepository.save(update);
    // if (toUpdate.visitors.length > 0) {
    //   if (updateIndustrialVisitDto.no_of_students > toUpdate.no_of_students) {
    //     const mailData = {
    //       to: user.email,
    //       subject: `Created new industrial visit`,
    //       text: createIVEmailText({
    //         firstName: user.firstName,
    //         lastName: user.lastName,
    //         IVData: savedData,
    //       }),
    //     };
    //     await this.mailService.sendMail(mailData);
    //   }
    //   if (updateIndustrialVisitDto.no_of_faculty > toUpdate.no_of_faculty) {
    //     throw new HttpException(
    //       { message: 'Bad Request, You cannot decrease the no.of faculty' },
    //       HttpStatus.BAD_REQUEST,
    //     );
    //   }
    //   if (
    //     updateIndustrialVisitDto.available_institute >
    //     toUpdate.available_institute
    //   ) {
    //     throw new HttpException(
    //       {
    //         message: 'Bad Request, You cannot decrease the available institute',
    //       },
    //       HttpStatus.BAD_REQUEST,
    //     );
    //   }
    // }
    return updatedData;
  }

  async delete(id: string) {
    return await this.industrialVisitRepository.delete({ id });
  }

  private buildIndustrialVisitDataRO(industrialVisit: IndustrialVisitEntity) {
    if (!industrialVisit) {
      return undefined;
    }
    const industrialVisitData: IndustrialVisitEntity = {
      id: industrialVisit.id,
      name: industrialVisit.name,
      description: industrialVisit.description,
      course_and_dept: industrialVisit.course_and_dept,
      no_of_students: industrialVisit.no_of_students,
      no_of_faculty: industrialVisit.no_of_faculty,
      contact_person: industrialVisit.contact_person,
      contact_no: industrialVisit.contact_no,
      alternative_contact_no: industrialVisit.alternative_contact_no,
      food_provide: industrialVisit.food_provide,
      available_institute: industrialVisit.available_institute,
      start_date: industrialVisit.start_date,
      end_date: industrialVisit.end_date,
      industry: industrialVisit.industry,
      visitors: industrialVisit.visitors,
      location: industrialVisit.location,
      createdAt: industrialVisit.createdAt,
    };
    return industrialVisitData;
  }
}
