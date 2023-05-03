import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config'
import { User } from '../users/entities/user.entity'
import jwtConfig from '../config/jwt.config'
import { HashingService } from './hashing/hashing.service'
import { BcryptService } from './hashing/bcrypt.service'
import { AuthenticationController } from './authentication/authentication.controller'
import { AuthenticationService } from './authentication/authentication.service'

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
    AuthenticationService,
  ],
  controllers: [AuthenticationController],
})
export class IamModule {}
