import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  Matches,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

// Грузинский номер: +995 и ровно 9 цифр после
export const GEO_PHONE_REGEX = /^\+995\d{9}$/;

// Email: обязательно домен с точкой
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class RegisterByEmailDto {
  @ApiProperty({ example: 'Иван Иванов' })
  @IsString()
  @IsNotEmpty({ message: 'Имя обязательно' })
  name: string;

  @ApiProperty({ example: 'ivan@gmail.com' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsEmail({}, { message: 'Некорректный email' })
  @Matches(EMAIL_REGEX, { message: 'Email должен содержать домен (например @gmail.com)' })
  email: string;

  @ApiProperty({ example: 'secret123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Пароль минимум 6 символов' })
  password: string;
}

export class RegisterByPhoneDto {
  @ApiProperty({ example: 'Иван Иванов' })
  @IsString()
  @IsNotEmpty({ message: 'Имя обязательно' })
  name: string;

  @ApiProperty({ example: '+995551234567', description: 'Грузинский номер: +995 и 9 цифр' })
  @Transform(({ value }) => value?.trim())
  @Matches(GEO_PHONE_REGEX, {
    message: 'Номер должен быть в формате +995XXXXXXXXX (9 цифр после кода)',
  })
  phone: string;

  @ApiProperty({ example: 'secret123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Пароль минимум 6 символов' })
  password: string;
}
