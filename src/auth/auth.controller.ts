import { AuthService } from './auth.service';
import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './get-user.decorator';
import { User } from './user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  singUp(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<void> {
    return this.authService.singUp(createUserDto);
  }

  @Post('/signin')
  signIn(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.singIn(createUserDto);
  }

  //temporary handler for tests

  @Post('/test')
  @UseGuards(AuthGuard())
  test(@GetUser() user: User) {
    console.log(user);
  }
}
