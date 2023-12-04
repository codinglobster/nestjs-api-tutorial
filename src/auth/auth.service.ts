import { ForbiddenException, Injectable } from '@nestjs/common';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: hash,
        },
      });
      delete user.hash;
      console.log(user);
      return user;
    } catch (error) {
      return error;
    }
  }

  async signin(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new ForbiddenException('Invalid credentials, user not found');
    }
    const pwMatches = await argon.verify(user.hash, dto.password);
    if (!pwMatches) {
      throw new ForbiddenException(
        'Invalid credentials, password does not match',
      );
    }
    return this.signToken(user.id, user.email);
  }

  async signToken(userId: number, email: string) {
    const payload = { sub: userId, email: email };
    const secret = this.config.get('JWT_SECRET');
    const token = this.jwt.sign(payload, { secret: secret, expiresIn: '15m' });
    return {
      access_token: token,
    };
  }
}
