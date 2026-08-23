import { IsArray, IsInt, IsNotEmpty, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ManualDemandLine {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class RunMrpDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ManualDemandLine)
  demand: ManualDemandLine[];
}