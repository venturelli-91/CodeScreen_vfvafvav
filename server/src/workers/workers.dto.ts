import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateWorkerDto {
	@IsString() @IsNotEmpty() name: string;
	@IsString() @IsNotEmpty() trade: string;
}

export class UpdateWorkerDto {
	@IsString() @IsNotEmpty() @IsOptional() name?: string;
	@IsString() @IsNotEmpty() @IsOptional() trade?: string;
}
