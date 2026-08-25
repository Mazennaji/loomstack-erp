import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum MaintenanceTypeDto {
  PREVENTIVE = 'PREVENTIVE',
  CORRECTIVE = 'CORRECTIVE',
  INSPECTION = 'INSPECTION',
}

export class LogMaintenanceDto {
  @IsString()
  machineId: string;

  @IsEnum(MaintenanceTypeDto)
  type: MaintenanceTypeDto;

  @IsDateString()
  date: string;

  @IsNumber()
  @Min(0)
  hoursAtService: number;

  @IsOptional()
  @IsString()
  notes?: string;
}