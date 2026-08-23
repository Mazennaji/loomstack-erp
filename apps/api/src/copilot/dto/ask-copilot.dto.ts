import { IsNotEmpty, IsString } from 'class-validator';

export class AskCopilotDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}