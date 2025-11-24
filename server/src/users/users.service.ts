import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, getRepository, Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as crypto from 'crypto-js';
import { UserRO } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IndInsService } from 'src/ind-ins/ind-ins.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => IndInsService))
    private indInsService: IndInsService,
  ) {}

  async create(userDto: CreateUserDto): Promise<UserRO> {
    const { email, password, indIns } = userDto;
    if (!email || !password || !indIns) {
      throw new HttpException(
        {
          message: !email
            ? 'email must be required'
            : !password
              ? 'password must be required'
              : 'industy / institute must be required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const qb = await this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = LOWER(:email)', { email });
    const getIndInd = await qb.getOne();
    if (getIndInd) {
      const errors = { email: 'email must be unique.' };
      throw new HttpException(
        { message: 'Input data validation failed', errors },
        HttpStatus.BAD_REQUEST,
      );
    }

    // get college / organization details
    let getIndInsDetail = {};
    if (userDto.indIns) {
      getIndInsDetail = await this.indInsService.findById(userDto.indIns.id);
    }

    // create new user
    const newData: any = {};
    newData.firstName = userDto.firstName;
    newData.lastName = userDto.lastName;
    newData.email = userDto.email.toLowerCase();
    newData.ph_no = userDto.ph_no;
    newData.role = userDto.role;
    newData.password = crypto.SHA256(userDto.password).toString();
    if (getIndInsDetail) newData.indIns = getIndInsDetail;

    const savedData = await this.userRepository.save(newData);
    return this.buildUserRO({ ...savedData, indIns: getIndInsDetail });
  }

  async createBulk(createDto: CreateUserDto[], allowUpdate: boolean = false) {
    const batchContainer: {
      batchNo: number;
      batchElements: CreateUserDto[];
    }[] = [];
    const batchSize = 300;
    let currentIndex = 0;
    let batchNo = 0;
    let currentBatch: { batchNo: number; batchElements: CreateUserDto[] } = {
      batchNo: batchNo,
      batchElements: [],
    };

    createDto.forEach((rowDto) => {
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

      const usersList: User[] = await Promise.all(
        batchElements.map(async (userDto) => {
          const { email } = userDto;
          const qb = await getRepository(User)
            .createQueryBuilder('user')
            .where('LOWER(user.email) = LOWER(:email)', { email: email });

          const getUser = await qb.getOne();

          if (getUser && !allowUpdate) {
            const errors = { email: 'Email must be unique.' };
            throw new HttpException(
              { message: 'Input data validation failed', errors },
              HttpStatus.BAD_REQUEST,
            );
          }

          // get industry / institute details
          const getIndInsDetail = await this.indInsService.findById(
            userDto.indIns.id,
          );

          // create new user
          let newData;
          if (getUser) {
            newData = getUser;
          } else {
            newData = new User();
          }
          newData.firstName = userDto.firstName;
          newData.lastName = userDto.lastName;
          newData.email = userDto.email.toLowerCase();
          newData.ph_no = userDto.ph_no;
          newData.role = userDto.role;
          newData.indIns = getIndInsDetail;
          newData.password = crypto.SHA256(userDto.password).toString();
          return newData;
        }),
      );

      await this.userRepository.save(usersList);
      console.log(
        'batch save',
        `Saved batch ${index} records from ${index * batchSize} to ${index * batchSize + batchElements.length}`,
      );
    }
    return;
  }

  async findAll(
    offset: number = 0,
    limit: number = 15,
    sort: string = 'firstName@ASC',
  ) {
    const [sortField, sortOrder] = sort.split('@');

    const options: FindManyOptions = {
      skip: offset,
      take: limit,
      order: { [`${sortField}`]: sortOrder },
      relations: ['indIns'],
      where: {
        role: Not('support'),
      },
    };

    const lists: User[] = await this.userRepository.find(options);
    return lists.map((list) => this.buildUserRO(list));
  }

  async findById(id: string): Promise<UserRO> {
    const userData = await this.userRepository.findOne({
      relations: ['indIns'],
      where: { id },
    });
    if (!userData) {
      return null;
    }
    return this.buildUserRO(userData);
  }

  async findOneByEmail(email: string): Promise<User> {
    const userData = await this.userRepository.findOne({
      relations: ['indIns'],
      where: { email },
    });

    if (!userData) {
      return null;
    }
    return userData;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserRO> {
    const toUpdate = await this.userRepository.findOne({ where: { id } });
    delete toUpdate.password;
    const updated = Object.assign(toUpdate, updateUserDto);
    await this.userRepository.save(updated);
    const userData = await this.findById(id);
    return userData;
  }

  async delete(id: string) {
    return await this.userRepository.delete({ id });
  }

  private buildUserRO(userData: User) {
    if (!userData) {
      return undefined;
    }
    const userRo: UserRO = {
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: userData.role,
      ph_no: userData.ph_no,
      indIns: userData.indIns ? userData.indIns : {},
    };
    return userRo;
  }
}
