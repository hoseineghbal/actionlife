import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, UserPermission, ALL_PERMISSIONS } from '../../users/schemas/user.schema';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<UserPermission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('دسترسی نامعتبر');
    }

    let userPermissions: UserPermission[] = (user.permissions as UserPermission[]) || [];

    if (user.role === UserRole.ADMIN && (!userPermissions || userPermissions.length === 0)) {
      userPermissions = [...ALL_PERMISSIONS];
    }

    const hasAll = requiredPermissions.every((perm) => userPermissions.includes(perm));
    if (!hasAll) {
      throw new ForbiddenException('دسترسی لازم برای انجام این عملیات را ندارید');
    }

    return true;
  }
}
