import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class AdjustStockDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  warehouseId: string;

  @IsInt()
  quantityChange: number; // positive to add stock, negative to remove
}