import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterByEmailDto, RegisterByPhoneDto } from '../dto/register.dto';

// ── RegisterByEmailDto ────────────────────────────────────────────────────────
describe('RegisterByEmailDto — валидация email', () => {
  const valid = { name: 'Иван', email: 'ivan@gmail.com', password: 'secret123' };

  async function check(data: object) {
    const dto = plainToInstance(RegisterByEmailDto, data);
    return validate(dto);
  }

  // Позитивные
  it('✅ корректные данные — нет ошибок', async () => {
    expect(await check(valid)).toHaveLength(0);
  });

  it('✅ email трансформируется в lowercase', async () => {
    const dto = plainToInstance(RegisterByEmailDto, { ...valid, email: 'IVAN@GMAIL.COM' });
    expect(dto.email).toBe('ivan@gmail.com');
  });

  // Негативные — email
  it('❌ email без домена (@gmail)', async () => {
    const errors = await check({ ...valid, email: 'ivan@gmail' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('❌ email без @', async () => {
    const errors = await check({ ...valid, email: 'ivangmail.com' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('❌ пустой email', async () => {
    const errors = await check({ ...valid, email: '' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('❌ email только @', async () => {
    const errors = await check({ ...valid, email: '@' });
    expect(errors.length).toBeGreaterThan(0);
  });

  // Негативные — пароль
  it('❌ пароль 5 символов', async () => {
    const errors = await check({ ...valid, password: '12345' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('✅ пароль ровно 6 символов', async () => {
    expect(await check({ ...valid, password: '123456' })).toHaveLength(0);
  });

  // Негативные — имя
  it('❌ пустое имя', async () => {
    const errors = await check({ ...valid, name: '' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('❌ отсутствует имя', async () => {
    const { name, ...rest } = valid;
    const errors = await check(rest);
    expect(errors.length).toBeGreaterThan(0);
  });
});

// ── RegisterByPhoneDto ────────────────────────────────────────────────────────
describe('RegisterByPhoneDto — валидация телефона', () => {
  const valid = { name: 'Иван', phone: '+995551234567', password: 'secret123' };

  async function check(data: object) {
    const dto = plainToInstance(RegisterByPhoneDto, data);
    return validate(dto);
  }

  // Позитивные
  it('✅ корректный грузинский номер', async () => {
    expect(await check(valid)).toHaveLength(0);
  });

  // Негативные — телефон
  it('❌ телефон без +995', async () => {
    const errors = await check({ ...valid, phone: '551234567' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('❌ другой код страны (+7)', async () => {
    const errors = await check({ ...valid, phone: '+79991234567' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('❌ 8 цифр вместо 9', async () => {
    const errors = await check({ ...valid, phone: '+99555123456' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('❌ 10 цифр вместо 9', async () => {
    const errors = await check({ ...valid, phone: '+9955512345678' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('❌ буквы в номере', async () => {
    const errors = await check({ ...valid, phone: '+995abc123456' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('❌ пустой телефон', async () => {
    const errors = await check({ ...valid, phone: '' });
    expect(errors.length).toBeGreaterThan(0);
  });

  // Негативные — пароль
  it('❌ пароль 5 символов', async () => {
    const errors = await check({ ...valid, password: '12345' });
    expect(errors.length).toBeGreaterThan(0);
  });
});
