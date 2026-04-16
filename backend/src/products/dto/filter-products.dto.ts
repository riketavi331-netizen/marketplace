import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FilterProductsDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() search?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() categoryId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() storeId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() brand?: string;
  @ApiProperty({ required: false, enum: ['MEN', 'WOMEN', 'UNISEX', 'KIDS'] }) @IsOptional() @IsString() gender?: string;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsNumber() minPrice?: number;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsNumber() maxPrice?: number;
  @ApiProperty({ required: false, default: 1 }) @IsOptional() @Type(() => Number) @IsNumber() page?: number;
  @ApiProperty({ required: false, default: 20 }) @IsOptional() @Type(() => Number) @IsNumber() limit?: number;
}
