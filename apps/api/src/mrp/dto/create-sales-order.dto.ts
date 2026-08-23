import { IsArray, IsDateString, IsInt, IsNotEmpty, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SalesOrderLineInput {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsDateString()
  dueDate: string;
}

export class CreateSalesOrderDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesOrderLineInput)
  lines: SalesOrderLineInput[];
}