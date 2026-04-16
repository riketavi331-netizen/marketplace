import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterByEmailDto, RegisterByPhoneDto } from './dto/register.dto';
import { LoginByEmailDto, LoginByPhoneDto } from './dto/login.dto';
import { RegisterSellerDto } from './dto/register-seller.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register/email')
  @ApiOperation({ summary: 'Регистрация по email' })
  registerByEmail(@Body() dto: RegisterByEmailDto) {
    return this.authService.registerByEmail(dto);
  }

  @Post('register/phone')
  @ApiOperation({ summary: 'Регистрация по телефону (+995)' })
  registerByPhone(@Body() dto: RegisterByPhoneDto) {
    return this.authService.registerByPhone(dto);
  }

  @Post('login/email')
  @ApiOperation({ summary: 'Вход по email' })
  loginByEmail(@Body() dto: LoginByEmailDto) {
    return this.authService.loginByEmail(dto);
  }

  @Post('login/phone')
  @ApiOperation({ summary: 'Вход по телефону (+995)' })
  loginByPhone(@Body() dto: LoginByPhoneDto) {
    return this.authService.loginByPhone(dto);
  }

  @Post('register/seller')
  @ApiOperation({ summary: 'Регистрация продавца — создаёт аккаунт STORE_OWNER + магазин' })
  registerSeller(@Body() dto: RegisterSellerDto) {
    return this.authService.registerSeller(dto);
  }
}
