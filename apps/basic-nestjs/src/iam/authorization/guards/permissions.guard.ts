import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { REQUEST_USER_KEY } from '../../iam.constants'
import { ActiveUserData } from '../../interfaces/active-user-data.interface'
import { ROLES_KEY } from '../decorators/roles.decorator'
import { PermissionType } from '../permission.type'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const contextPermissions = this.reflector.getAllAndOverride<PermissionType[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!contextPermissions)
      return true

    const user: ActiveUserData = context.switchToHttp().getRequest()[REQUEST_USER_KEY]
    return contextPermissions.every(permission => user.permissions?.includes(permission))
  }
}
