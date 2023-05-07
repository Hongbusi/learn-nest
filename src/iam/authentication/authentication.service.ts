import { randomUUID } from 'node:crypto'
import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import { ConfigType } from '@nestjs/config'
import { User } from '../../users/entities/user.entity'
import { HashingService } from '../hashing/hashing.service'
import jwtConfig from '../../config/jwt.config'
import { ActiveUserData } from '../interfaces/active-user-data.interface'
import { SignUpDto } from './dto/sign-up.dto'
import { SignInDto } from './dto/sign-in.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { InvalidatedRefreshTokenError, RefreshTokenIdsStorage } from './refresh-token-ids.storage'

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
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

    return await this.generateTokens(user)
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub, refreshTokenId } = await this.jwtService.verifyAsync<Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }>(
        refreshTokenDto.refreshToken,
        {
          secret: this.jwtConfiguration.secret,
          audience: this.jwtConfiguration.audience,
          issuer: this.jwtConfiguration.issuer,
        },
      )
      const user = await this.userRepository.findOneByOrFail({
        id: sub,
      })
      const isValid = await this.refreshTokenIdsStorage.validate(user.id, refreshTokenId)
      if (isValid)
        await this.refreshTokenIdsStorage.invalidate(user.id)
      else
        throw new Error('Refresh token is invalid')
      return await this.generateTokens(user)
    }
    catch (error) {
      if (error instanceof InvalidatedRefreshTokenError)
        throw new UnauthorizedException('Access denied')

      throw new UnauthorizedException()
    }
  }

  async generateTokens(user: User) {
    const refreshTokenId = randomUUID()
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        { email: user.email, role: user.role },
      ),
      this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl, {
        refreshTokenId,
      }),
    ])
    return {
      accessToken,
      refreshToken,
    }
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
