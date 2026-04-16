import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  size?: string;
  qty: number;
}

@Injectable()
export class CartService implements OnModuleInit {
  private redis: Redis;

  constructor(private config: ConfigService) {}

  onModuleInit() {
    this.redis = new Redis(this.config.get<string>('REDIS_URL') || 'redis://localhost:6379');
  }

  private key(userId: string) {
    return `cart:${userId}`;
  }

  async getCart(userId: string): Promise<CartItem[]> {
    const data = await this.redis.get(this.key(userId));
    return data ? JSON.parse(data) : [];
  }

  async addItem(userId: string, item: CartItem): Promise<CartItem[]> {
    const cart = await this.getCart(userId);
    const idx = cart.findIndex((i) => i.productId === item.productId && i.size === item.size);

    if (idx >= 0) {
      cart[idx].qty += item.qty;
    } else {
      cart.push(item);
    }

    await this.redis.set(this.key(userId), JSON.stringify(cart), 'EX', 60 * 60 * 24 * 7);
    return cart;
  }

  async updateItem(userId: string, productId: string, size: string | undefined, qty: number): Promise<CartItem[]> {
    const cart = await this.getCart(userId);
    const idx = cart.findIndex((i) => i.productId === productId && i.size === size);

    if (idx >= 0) {
      if (qty <= 0) {
        cart.splice(idx, 1);
      } else {
        cart[idx].qty = qty;
      }
    }

    await this.redis.set(this.key(userId), JSON.stringify(cart), 'EX', 60 * 60 * 24 * 7);
    return cart;
  }

  async clearCart(userId: string) {
    await this.redis.del(this.key(userId));
    return [];
  }
}
