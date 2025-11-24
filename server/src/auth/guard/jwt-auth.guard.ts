import {
  CanActivate,
  ExecutionContext,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/users/users.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private secret: string;
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(forwardRef(() => UserService)) private userService: UserService,
  ) {
    this.secret = this.configService.get('auth.secret');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeaders = request.headers.authorization;
    if (authHeaders && (authHeaders as string).split(' ')[1]) {
      const token = (authHeaders as string).split(' ')[1];
      let decoded: any = '';
      try {
        decoded = await this.jwtService.verifyAsync(token, {
          secret: this.secret,
        });
        const user = await this.userService.findById(decoded.id);
        if (!user) {
          throw new HttpException('user not found.', HttpStatus.UNAUTHORIZED);
        }
        request['user'] = user;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        throw new HttpException(
          'Invalid input / token.',
          HttpStatus.UNAUTHORIZED,
        );
      }
      return true;
    } else {
      throw new HttpException('Not authorized.', HttpStatus.UNAUTHORIZED);
    }
  }
}
