import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

// ── Моки ────────────────────────────────────────────────────────────────────
const mockUser = {
  id: 'user-1',
  name: 'Иван',
  email: 'ivan@gmail.com',
  phone: '+995551234567',
  password: '',
  role: 'CUSTOMER',
};

const prismaMock = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
  },
};

const jwtMock = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
};

// ── Хелперы ──────────────────────────────────────────────────────────────────
async function buildService() {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      AuthService,
      { provide: PrismaService, useValue: prismaMock },
      { provide: JwtService, useValue: jwtMock },
    ],
  }).compile();
  return module.get<AuthService>(AuthService);
}

// ── Тесты ────────────────────────────────────────────────────────────────────
describe('AuthService', () => {
  let service: AuthService;

  beforeAll(async () => {
    mockUser.password = await bcrypt.hash('secret123', 10);
    service = await buildService();
  });

  beforeEach(() => jest.clearAllMocks());

  // ── registerByEmail ──────────────────────────────────────────────────────
  describe('registerByEmail', () => {
    it('✅ создаёт пользователя и возвращает токен', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(mockUser);

      const result = await service.registerByEmail({
        name: 'Иван',
        email: 'ivan@gmail.com',
        password: 'secret123',
      });

      expect(result).toEqual({ access_token: 'mock.jwt.token' });
      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    });

    it('❌ email уже существует — BadRequestException', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.registerByEmail({ name: 'Иван', email: 'ivan@gmail.com', password: 'secret123' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── registerByPhone ──────────────────────────────────────────────────────
  describe('registerByPhone', () => {
    it('✅ создаёт пользователя по телефону', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(mockUser);

      const result = await service.registerByPhone({
        name: 'Иван',
        phone: '+995551234567',
        password: 'secret123',
      });

      expect(result).toEqual({ access_token: 'mock.jwt.token' });
    });

    it('❌ телефон уже существует — BadRequestException', async () => {
      prismaMock.user.findFirst.mockResolvedValue(mockUser);

      await expect(
        service.registerByPhone({ name: 'Иван', phone: '+995551234567', password: 'secret123' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── loginByEmail ─────────────────────────────────────────────────────────
  describe('loginByEmail', () => {
    it('✅ правильные данные — возвращает токен', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.loginByEmail({
        email: 'ivan@gmail.com',
        password: 'secret123',
      });

      expect(result).toEqual({ access_token: 'mock.jwt.token' });
    });

    it('❌ email не найден — UnauthorizedException', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.loginByEmail({ email: 'wrong@gmail.com', password: 'secret123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('❌ неверный пароль — UnauthorizedException', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.loginByEmail({ email: 'ivan@gmail.com', password: 'wrongpass' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── loginByPhone ─────────────────────────────────────────────────────────
  describe('loginByPhone', () => {
    it('✅ правильные данные — возвращает токен', async () => {
      prismaMock.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.loginByPhone({
        phone: '+995551234567',
        password: 'secret123',
      });

      expect(result).toEqual({ access_token: 'mock.jwt.token' });
    });

    it('❌ телефон не найден — UnauthorizedException', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);

      await expect(
        service.loginByPhone({ phone: '+995999999999', password: 'secret123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('❌ неверный пароль — UnauthorizedException', async () => {
      prismaMock.user.findFirst.mockResolvedValue(mockUser);

      await expect(
        service.loginByPhone({ phone: '+995551234567', password: 'wrongpass' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
