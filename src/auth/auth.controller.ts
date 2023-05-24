import { Body, Controller, Post } from '@nestjs/common'
import { Public } from '../common/decorators/public.decorator'
import { SignInDto } from './dto/sign-in.dto'
import { AuthService } from './auth.service'
import { SignUpDto } from './dto/sign-up.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto)
  }

  @Public()
  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto)
  }
}
