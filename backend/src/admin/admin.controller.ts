import { Controller, Get, Patch, Param, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';
import { AdminService } from './admin.service';

function adminGuard(req: any) {
  if (req.user?.role !== 'ADMIN') throw new ForbiddenException('Только для администраторов');
}

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  getStats(@Request() req: any) {
    adminGuard(req);
    return this.adminService.getStats();
  }

  @Get('customers')
  getCustomers(@Request() req: any) {
    adminGuard(req);
    return this.adminService.getCustomers();
  }

  @Get('store-owners')
  getStoreOwners(@Request() req: any) {
    adminGuard(req);
    return this.adminService.getStoreOwners();
  }

  @Get('stores')
  getStores(@Request() req: any) {
    adminGuard(req);
    return this.adminService.getStores();
  }

  @Patch('users/:id/freeze')
  freezeUser(@Request() req: any, @Param('id') id: string, @Body('frozen') frozen: boolean) {
    adminGuard(req);
    return this.adminService.freezeUser(id, frozen);
  }

  @Patch('stores/:id/freeze')
  freezeStore(@Request() req: any, @Param('id') id: string, @Body('frozen') frozen: boolean) {
    adminGuard(req);
    return this.adminService.freezeStore(id, frozen);
  }

  // legacy
  @Get('dashboard')
  getDashboard(@Request() req: any) {
    adminGuard(req);
    return this.adminService.getDashboard();
  }

  @Get('users')
  getUsers(@Request() req: any) {
    adminGuard(req);
    return this.adminService.getUsers();
  }
}
