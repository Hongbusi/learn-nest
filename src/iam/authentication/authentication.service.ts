import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { HashingService } from '../hashing/hashing.service'
import { SignUpDto } from './dto/sign-up.dto'
import { SignInDto } from './dto/sign-in.dto'

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    try {
      const user = new User()
      user.email = signUpDto.email
      user.password = await this.hashingService.hash(signUpDto.password)

      await this.userRepository.save(user)
    }
    catch (error) {
      const pgUniqueViolationErrorCode = '23505'
      if (error?.code === pgUniqueViolationErrorCode)
        throw new ConflictException()
      throw error
    }
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.userRepository.findOneBy({
      email: signInDto.email,
    })
    if (!user)
      throw new UnauthorizedException('User does not exist')

    const isEqual = await this.hashingService.compare(
      signInDto.password,
      user.password,
    )
    if (!isEqual)
      throw new UnauthorizedException('Password does not match')

    // TODO things to do after sign in
    return true
  }
}
