import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'
import jwtConfig from '../../../config/jwt.config'
import { REQUEST_USER_KEY } from '../../../iam/iam.constants'

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token = this.extractTokenFromHeader(request)
    if (!token)
      throw new UnauthorizedException()

    try {
      const payload = this.jwtService.verifyAsync(token, this.jwtConfiguration)
      request[REQUEST_USER_KEY] = payload
      console.log(payload)
    }
    catch (error) {
      throw new UnauthorizedException()
    }
    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [_, token] = request.headers.authorization?.split(' ') ?? []

    return token
  }
}
