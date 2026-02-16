import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CacheService } from 'src/cache/cache.service';
import { ConfigService } from '@nestjs/config';
import { CONFIG_JWT_SECRET } from '../constants/auth.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(CONFIG_JWT_SECRET, 'your-super-secret-key'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    // Get the token from the request
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // Check if token is blacklisted
    const isBlacklisted = await this.cacheService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }

    return { userId: payload.userId, email: payload.email };
  }
}
