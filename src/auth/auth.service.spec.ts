import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';

type MockRepository<T = any> = Partial<
  Record<keyof Repository<User>, jest.Mock>
>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  save: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(),
});

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: MockRepository<User>;
  let jwtService: JwtService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository<User>(),
        },
        {
          provide: JwtService,
          useFactory: mockJwtService,
        },
      ],
    }).compile();
    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('SignUp', () => {
    it('successfully sign up the user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'mohammad',
        password: '1234',
      };
      const user = new User();
      user.save = jest.fn().mockResolvedValue(undefined);
      await expect(authService.singUp(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
