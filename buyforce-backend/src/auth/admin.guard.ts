import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      throw new ForbiddenException('אין גישה - משתמש לא מחובר');
    }

    if (user.role !== 'admin') {
      throw new ForbiddenException('גישה מותרת רק למנהל');
    }

    return true;
  }
}
