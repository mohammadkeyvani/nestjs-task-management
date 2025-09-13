import { CreateUserDto } from './dto/create-user.dto';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async singUp(createUserDto: CreateUserDto): Promise<void> {
    const { username, password } = createUserDto;

    const user = new User();
    user.username = username;
    user.salt = await bcrypt.genSalt();
    user.password = await this.hashPassword(password, user.salt);

    try {
      await user.save();
    } catch (error) {
      if (error.code === '23505') {
        // duplicate user error
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async singIn(createUserDto: CreateUserDto): Promise<{ accessToken: string }> {
    const username = await this.validationUserPassword(createUserDto);

    if (!username) {
      throw new UnauthorizedException('invalid username or password');
    }

    const payload: JwtPayload = { username };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  private async validationUserPassword(
    createUserDto: CreateUserDto,
  ): Promise<string | null> {
    const { username, password } = createUserDto;
    const user = await this.userRepository.findOne({ where: { username } });
    if (user && (await user.validatePassword(password))) {
      return user.username;
    } else {
      return null;
    }
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }
}
