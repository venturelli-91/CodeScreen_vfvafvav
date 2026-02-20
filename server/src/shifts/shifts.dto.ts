import { IsString, IsDateString } from 'class-validator'

export class CreateShiftDto {
  @IsDateString() start: string
  @IsDateString() end: string
  @IsString() trade: string
  @IsString() workplaceId: string
}

export class ClaimShiftDto {
  @IsString() workerId: string
}
