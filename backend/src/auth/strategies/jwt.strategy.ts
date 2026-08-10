import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserPermission } from '../../users/schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'actionlife-secret',
    });
  }

  validate(payload: {
    sub: string;
    mobile: string;
    countryCode: string;
    role: string;
    fullName: string;
    permissions?: UserPermission[];
  }) {
    return {
      userId: payload.sub,
      mobile: payload.mobile,
      countryCode: payload.countryCode,
      role: payload.role,
      fullName: payload.fullName,
      permissions: payload.permissions || [],
    };
  }
}
