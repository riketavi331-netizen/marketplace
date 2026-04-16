import { IsString, IsNumber, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty() @IsString() storeId: string;
  @ApiProperty() @IsString() categoryId: string;
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty() @Type(() => Number) @IsNumber() price: number;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsNumber() oldPrice?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() brand?: string;
  @ApiProperty({ required: false, enum: ['MEN', 'WOMEN', 'UNISEX', 'KIDS'] }) @IsOptional() @IsString() gender?: string;
  @ApiProperty({ type: [String], required: false }) @IsOptional() @IsArray() sizes?: string[];
  @ApiProperty({ type: [String], required: false }) @IsOptional() @IsArray() images?: string[];
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() inStock?: boolean;
}
