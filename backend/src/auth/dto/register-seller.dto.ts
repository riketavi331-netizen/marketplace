import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { EMAIL_REGEX, GEO_PHONE_REGEX } from './register.dto';

// Грузинский паспорт: ровно 9 цифр
export const GEO_PASSPORT_REGEX = /^\d{9}$/;

export class RegisterSellerDto {
  // ── Личные данные владельца ──────────────────────────────

  @ApiProperty({ example: 'Георгий' })
  @IsString()
  @IsNotEmpty({ message: 'Имя обязательно' })
  firstName: string;

  @ApiProperty({ example: 'Иванов' })
  @IsString()
  @IsNotEmpty({ message: 'Фамилия обязательна' })
  lastName: string;

  @ApiProperty({ example: '01234567890', description: 'ID грузинского паспорта — 9 цифр' })
  @Transform(({ value }) => value?.trim())
  @Matches(GEO_PASSPORT_REGEX, { message: 'ID паспорта должен содержать ровно 9 цифр' })
  passportId: string;

  @ApiProperty({ example: 'owner@store.com' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsEmail({}, { message: 'Некорректный email' })
  @Matches(EMAIL_REGEX, { message: 'Email должен содержать домен' })
  email: string;

  @ApiProperty({ example: '+995551234567' })
  @Transform(({ value }) => value?.trim())
  @Matches(GEO_PHONE_REGEX, { message: 'Номер должен быть в формате +995XXXXXXXXX' })
  phone: string;

  @ApiProperty({ example: 'Тбилиси, ул. Руставели 1, кв. 5' })
  @IsString()
  @IsNotEmpty({ message: 'Почтовый адрес обязателен' })
  postalAddress: string;

  @ApiProperty({ example: 'secret123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Пароль минимум 6 символов' })
  password: string;

  // ── Данные магазина ──────────────────────────────────────

  @ApiProperty({ example: 'Мой магазин' })
  @IsString()
  @IsNotEmpty({ message: 'Название магазина обязательно' })
  storeName: string;

  @ApiProperty({ example: '123456789', required: false, description: 'Номер ИП (необязательно)' })
  @IsOptional()
  @Transform(({ value }) => value?.trim() || undefined)
  @IsString()
  taxId?: string;

  @ApiProperty({ example: 'Тбилиси, ул. Руставели 1' })
  @IsString()
  @IsNotEmpty({ message: 'Адрес магазина обязателен' })
  storeAddress: string;

  @ApiProperty({ example: '+995551234567', required: false })
  @IsOptional()
  @Transform(({ value }) => value?.trim() || undefined)
  @Matches(GEO_PHONE_REGEX, { message: 'Номер магазина должен быть в формате +995XXXXXXXXX' })
  storePhone?: string;
}
