import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigType } from '@nestjs/config'
import { UsersService } from '../users/users.service'
import { HashingService } from '../hashing/hashing.service'
import { User } from '../users/entities/user.entity'
import jwtConfig from '../config/jwt.config'
import { ActiveUserData } from '../constants'
import { SignInDto } from './dto/sign-in.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async signIn(signInDto: SignInDto) {
    const { name, password } = signInDto

    const user = await this.usersService.findOne(name)
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
