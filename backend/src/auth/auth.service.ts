import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterByEmailDto, RegisterByPhoneDto } from './dto/register.dto';
import { LoginByEmailDto, LoginByPhoneDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  // ─── Регистрация по email ───────────────────────────────
  async registerByEmail(dto: RegisterByEmailDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Email уже используется');

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: await bcrypt.hash(dto.password, 10),
      },
    });

    return this.signToken(user.id, user.email);
  }

  // ─── Регистрация по телефону ────────────────────────────
  async registerByPhone(dto: RegisterByPhoneDto) {
    const exists = await this.prisma.user.findFirst({ where: { phone: dto.phone } });
    if (exists) throw new BadRequestException('Телефон уже используется');

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        // email не обязателен при регистрации по телефону
        email: `phone_${dto.phone.replace('+', '')}@marketplace.local`,
        password: await bcrypt.hash(dto.password, 10),
      },
    });

    return this.signToken(user.id, user.email);
  }

  // ─── Вход по email ──────────────────────────────────────
  async loginByEmail(dto: LoginByEmailDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Неверный email или пароль');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Неверный email или пароль');

    return this.signToken(user.id, user.email);
  }

  // ─── Вход по телефону ───────────────────────────────────
  async loginByPhone(dto: LoginByPhoneDto) {
    const user = await this.prisma.user.findFirst({ where: { phone: dto.phone } });
    if (!user) throw new UnauthorizedException('Неверный телефон или пароль');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Неверный телефон или пароль');

    return this.signToken(user.id, user.email);
  }

  private signToken(userId: string, email: string) {
    return {
      access_token: this.jwt.sign({ sub: userId, email }),
    };
  }
}
