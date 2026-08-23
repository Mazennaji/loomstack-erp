import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class ReserveStockDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  warehouseId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}