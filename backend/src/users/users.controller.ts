import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Мой профиль' })
  getProfile(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Обновить профиль' })
  updateProfile(@Request() req, @Body() body: { name?: string; phone?: string; address?: string }) {
    return this.usersService.updateProfile(req.user.id, body);
  }

  @Get('me/orders')
  @ApiOperation({ summary: 'Мои заказы' })
  getMyOrders(@Request() req) {
    return this.usersService.getMyOrders(req.user.id);
  }
}
