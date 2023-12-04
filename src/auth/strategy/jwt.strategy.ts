import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // ExtractJwt.fromAuthHeaderAsBearerToken() is a passport-jwt method that extracts the JWT from the header of the request.
      ignoreExpiration: false, // ignoreExpiration: false means that if the JWT is expired, the user will not be authenticated.
      secretOrKey: config.get('JWT_SECRET'), // secretOrKey is the secret key that was used to sign the JWT in the first place.
    });
  }

  async validate(payload: { sub: number; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    delete user.hash;
    return user;
  }
}
