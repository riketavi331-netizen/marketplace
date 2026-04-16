import { IsString, MinLength, IsOptional, Matches, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { EMAIL_REGEX, GEO_PHONE_REGEX } from './register.dto';

export class LoginByEmailDto {
  @ApiProperty({ example: 'ivan@gmail.com' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @Matches(EMAIL_REGEX, { message: 'Некорректный email' })
  email: string;

  @ApiProperty({ example: 'secret123' })
  @IsString()
  @MinLength(6, { message: 'Пароль минимум 6 символов' })
  password: string;
}

export class LoginByPhoneDto {
  @ApiProperty({ example: '+995551234567' })
  @Transform(({ value }) => value?.trim())
  @Matches(GEO_PHONE_REGEX, { message: 'Номер должен быть в формате +995XXXXXXXXX' })
  phone: string;

  @ApiProperty({ example: 'secret123' })
  @IsString()
  @MinLength(6, { message: 'Пароль минимум 6 символов' })
  password: string;
}
