import { IsString } from "class-validator";

export class CreateWorkerDto {
	@IsString() name: string;
	@IsString() trade: string;
}
