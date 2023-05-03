import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { Public } from '../../common/decorators/public.decorator'
import { AuthenticationService } from './authentication.service'
import { SignInDto } from './dto/sign-in.dto'
import { SignUpDto } from './dto/sign-up.dto'
import { Auth } from './decorators/auth.decorator'
import { AuthType } from './enums/auth-type.enums'

@Auth(AuthType.None)
@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Public()
  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto)
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto)
  }
}
