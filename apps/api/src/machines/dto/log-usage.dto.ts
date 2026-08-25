import { IsDateString, IsInt, IsNumber, IsString, Min } from 'class-validator';

export class LogUsageDto {
  @IsString()
  machineId: string;

  @IsDateString()
  date: string;

  @IsNumber()
  @Min(0)
  hoursRun: number;

  @IsInt()
  @Min(0)
  cycles: number;
}