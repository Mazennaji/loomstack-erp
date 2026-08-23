import { IsNotEmpty, IsString } from 'class-validator';

export class ExecuteOrderDto {
  @IsString()
  @IsNotEmpty()
  warehouseId: string;
}