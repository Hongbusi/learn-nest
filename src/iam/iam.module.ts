import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { User } from '../users/entities/user.entity'
import jwtConfig from '../config/jwt.config'
import { HashingService } from './hashing/hashing.service'
import { BcryptService } from './hashing/bcrypt.service'
import { AuthenticationController } from './authentication/authentication.controller'
import { AuthenticationService } from './authentication/authentication.service'
import { AuthenticationGuard } from './authentication/guards/authentication.guard'
import { AccessTokenGuard } from './authentication/guards/access-token.guard'
import { RefreshTokenIdsStorage } from './authentication/refresh-token-ids.storage'
import { PolicyHandlerStorage } from './authorization/policies/policy-handlers.storage'
import { FrameworkContributorPolicyHandler } from './authorization/policies/framework-contributor.policy'
import { PoliciesGuard } from './authorization/guards/policies.guards'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
  ],
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PoliciesGuard, // RolesGuard
    },
    AccessTokenGuard,
    RefreshTokenIdsStorage,
    AuthenticationService,
    PolicyHandlerStorage,
    FrameworkContributorPolicyHandler,
  ],
  controllers: [AuthenticationController],
})
export class IamModule {}
