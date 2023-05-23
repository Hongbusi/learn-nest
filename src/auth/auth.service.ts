import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigType } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../users/entities/user.entity'
import jwtConfig from '../config/jwt.config'
import { ActiveUserData } from '../constants'
import { HashingService } from './hashing.service'
import { SignInDto } from './dto/sign-in.dto'
import { SignUpDto } from './dto/sign-up.dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { name, password } = signUpDto

    const existingUser = await this.userRepository.findOne({ where: [{ name }] })
    if (existingUser)
      throw new UnauthorizedException('User already exists')

    const hashedPassword = await this.hashingService.hash(password)
    const user = this.userRepository.create({
      ...signUpDto,
      password: hashedPassword,
    })
    return this.userRepository.save(user)
  }

  async signIn(signInDto: SignInDto) {
    const { name, password } = signInDto

    const user = await this.userRepository.findOne({ where: { name } })
    if (!user)
      throw new UnauthorizedException('User not found')

    const isEqual = await this.hashingService.compare(password, user.password)
    if (!isEqual)
      throw new UnauthorizedException('Password is incorrect')

    return await this.generateTokens(user)
  }

  async generateTokens(user: User) {
    const token = await this.signToken<Partial<ActiveUserData>>(
      user.id,
      3600,
      { name: user.name },
    )
    return { token }
  }

  private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        expiresIn: this.jwtConfiguration.accessTokenTtl,
      },
    )
  }
}
