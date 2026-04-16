import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { EMAIL_REGEX, GEO_PHONE_REGEX } from './register.dto';

export class RegisterSellerDto {
  // ── Личные данные ──
  @ApiProperty({ example: 'Георгий Иванов' })
  @IsString()
  @IsNotEmpty({ message: 'Имя обязательно' })
  name: string;

  @ApiProperty({ example: 'owner@store.com' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsEmail({}, { message: 'Некорректный email' })
  @Matches(EMAIL_REGEX, { message: 'Email должен содержать домен' })
  email: string;

  @ApiProperty({ example: '+995551234567' })
  @Transform(({ value }) => value?.trim())
  @Matches(GEO_PHONE_REGEX, { message: 'Номер должен быть в формате +995XXXXXXXXX' })
  phone: string;

  @ApiProperty({ example: 'secret123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Пароль минимум 6 символов' })
  password: string;

  // ── Данные магазина ──
  @ApiProperty({ example: 'Мой магазин' })
  @IsString()
  @IsNotEmpty({ message: 'Название магазина обязательно' })
  storeName: string;

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
