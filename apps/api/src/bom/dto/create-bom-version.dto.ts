import { IsArray, IsNotEmpty, IsNumber, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class BomLineInput {
  @IsString()
  @IsNotEmpty()
  componentProductId: string;

  @IsNumber()
  @Min(0.0001)
  quantity: number;
}

export class CreateBomVersionDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BomLineInput)
  lines: BomLineInput[];
}