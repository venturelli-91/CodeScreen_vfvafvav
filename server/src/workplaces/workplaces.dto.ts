import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateWorkplaceDto {
	@IsString() @IsNotEmpty() name: string;
	@IsString() @IsNotEmpty() address: string;
}

export class UpdateWorkplaceDto {
	@IsString() @IsNotEmpty() @IsOptional() name?: string;
	@IsString() @IsNotEmpty() @IsOptional() address?: string;
}
