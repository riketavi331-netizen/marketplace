import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth E2E (/api/auth)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const email = `test_${Date.now()}@gmail.com`;
  const phone = `+995${Math.floor(100000000 + Math.random() * 900000000)}`;
  const password = 'secret123';
  const name = 'Тест Пользователь';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    // Чистим тестовых пользователей
    await prisma.user.deleteMany({
      where: { OR: [{ email }, { phone }] },
    });
    await app.close();
  });

  // ── POST /api/auth/register/email ───────────────────────────────────────
  describe('POST /auth/register/email', () => {
    it('✅ 201 — успешная регистрация', () =>
      request(app.getHttpServer())
        .post('/api/auth/register/email')
        .send({ name, email, password })
        .expect(201)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
        }));

    it('❌ 400 — email уже используется', () =>
      request(app.getHttpServer())
        .post('/api/auth/register/email')
        .send({ name, email, password })
        .expect(400));

    it('❌ 400 — email без домена', () =>
      request(app.getHttpServer())
        .post('/api/auth/register/email')
        .send({ name, email: 'invalid@nodomain', password })
        .expect(400));

    it('❌ 400 — email без @', () =>
      request(app.getHttpServer())
        .post('/api/auth/register/email')
        .send({ name, email: 'notanemail', password })
        .expect(400));

    it('❌ 400 — пароль 5 символов', () =>
      request(app.getHttpServer())
        .post('/api/auth/register/email')
        .send({ name, email: `short_${Date.now()}@gmail.com`, password: '12345' })
        .expect(400));

    it('❌ 400 — пустое имя', () =>
      request(app.getHttpServer())
        .post('/api/auth/register/email')
        .send({ name: '', email: `noname_${Date.now()}@gmail.com`, password })
        .expect(400));

    it('❌ 400 — отсутствующие поля', () =>
      request(app.getHttpServer())
        .post('/api/auth/register/email')
        .send({})
        .expect(400));
  });

  // ── POST /api/auth/register/phone ───────────────────────────────────────
  describe('POST /auth/register/phone', () => {
    it('✅ 201 — успешная регистрация по телефону', () =>
      request(app.getHttpServer())
        .post('/api/auth/register/phone')
        .send({ name, phone, password })
        .expect(201)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
        }));

    it('❌ 400 — телефон уже используется', () =>
      request(app.getHttpServer())
        .post('/api/auth/register/phone')
        .send({ name, phone, password })
        .expect(400));

    it('❌ 400 — номер без +995', () =>
      request(app.getHttpServer())
        .post('/api/auth/register/phone')
        .send({ name, phone: '551234567', password })
        .expect(400));

    it('❌ 400 — номер с кодом +7 (Россия)', () =>
      request(app.getHttpServer())
        .post('/api/auth/register/phone')
        .send({ name, phone: '+79991234567', password })
        .expect(400));

    it('❌ 400 — 8 цифр вместо 9', () =>
      request(app.getHttpServer())
        .post('/api/auth/register/phone')
        .send({ name, phone: '+99555123456', password })
        .expect(400));

    it('❌ 400 — 10 цифр вместо 9', () =>
      request(app.getHttpServer())
        .post('/api/auth/register/phone')
        .send({ name, phone: '+9955512345678', password })
        .expect(400));

    it('❌ 400 — пароль 5 символов', () =>
      request(app.getHttpServer())
        .post('/api/auth/register/phone')
        .send({ name, phone: `+995${Math.floor(100000000 + Math.random() * 900000000)}`, password: 'short' })
        .expect(400));
  });

  // ── POST /api/auth/login/email ──────────────────────────────────────────
  describe('POST /auth/login/email', () => {
    it('✅ 201 — успешный вход по email', () =>
      request(app.getHttpServer())
        .post('/api/auth/login/email')
        .send({ email, password })
        .expect(201)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
        }));

    it('❌ 401 — неверный пароль', () =>
      request(app.getHttpServer())
        .post('/api/auth/login/email')
        .send({ email, password: 'wrongpassword' })
        .expect(401));

    it('❌ 401 — несуществующий email', () =>
      request(app.getHttpServer())
        .post('/api/auth/login/email')
        .send({ email: 'nobody@gmail.com', password })
        .expect(401));

    it('❌ 400 — некорректный email', () =>
      request(app.getHttpServer())
        .post('/api/auth/login/email')
        .send({ email: 'notanemail', password })
        .expect(400));

    it('❌ 400 — пустые поля', () =>
      request(app.getHttpServer())
        .post('/api/auth/login/email')
        .send({})
        .expect(400));
  });

  // ── POST /api/auth/login/phone ──────────────────────────────────────────
  describe('POST /auth/login/phone', () => {
    it('✅ 201 — успешный вход по телефону', () =>
      request(app.getHttpServer())
        .post('/api/auth/login/phone')
        .send({ phone, password })
        .expect(201)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
        }));

    it('❌ 401 — неверный пароль', () =>
      request(app.getHttpServer())
        .post('/api/auth/login/phone')
        .send({ phone, password: 'wrongpassword' })
        .expect(401));

    it('❌ 401 — несуществующий номер', () =>
      request(app.getHttpServer())
        .post('/api/auth/login/phone')
        .send({ phone: '+995500000001', password })
        .expect(401));

    it('❌ 400 — номер без +995', () =>
      request(app.getHttpServer())
        .post('/api/auth/login/phone')
        .send({ phone: '551234567', password })
        .expect(400));
  });
});
