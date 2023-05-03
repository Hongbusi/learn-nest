import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import { ConfigType } from '@nestjs/config'
import { User } from '../../users/entities/user.entity'
import { HashingService } from '../hashing/hashing.service'
import jwtConfig from '../../config/jwt.config'
import { SignUpDto } from './dto/sign-up.dto'
import { SignInDto } from './dto/sign-in.dto'

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
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

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
      },
      {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        expiresIn: this.jwtConfiguration.accessTokenTtl,
      },
    )
    return {
      accessToken,
    }
  }
}
