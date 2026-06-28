import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    // Don't throw — just return user or null
    return user ?? null;
  }

  canActivate(context: ExecutionContext) {
    // Always allow access, just populate user if token is valid
    return super.canActivate(context);
  }
}
