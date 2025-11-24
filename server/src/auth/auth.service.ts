import { Injectable, HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto-js';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  async signIn(email, password) {
    const user = await this.userService.findOneByEmail(email);
    const errors = { User: 'user not found' };
    if (!user) {
      throw new HttpException({ errors }, 404);
    }

    const hashPass = await crypto.SHA256(password).toString();
    if (hashPass !== user.password) {
      const errors = { User: 'email or password incorrect' };
      throw new HttpException({ errors }, 404);
    }
    const payload = { id: user.id, email: user.email };
    delete user.password;
    return {
      ...user,
      access_token: await this.jwtService.signAsync(payload),
    };
  }
  async signUp(payload: CreateUserDto) {
    const user = await this.userService.create(payload);
    return this.signIn(user.email, payload.password);
  }
}
