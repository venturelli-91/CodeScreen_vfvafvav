import {
	IsString,
	IsNotEmpty,
	IsDateString,
	IsUUID,
	Validate,
	ValidatorConstraint,
	ValidatorConstraintInterface,
	ValidationArguments,
} from "class-validator";

@ValidatorConstraint({ name: "endAfterStart", async: false })
class EndAfterStart implements ValidatorConstraintInterface {
	validate(end: string, args: ValidationArguments) {
		const obj = args.object as CreateShiftDto;
		if (!obj.start || !end) return true; // let @IsDateString handle missing values
		return new Date(end) > new Date(obj.start);
	}
	defaultMessage() {
		return "end must be after start";
	}
}

export class CreateShiftDto {
	@IsDateString() @IsNotEmpty() start: string;
	@IsDateString() @IsNotEmpty() @Validate(EndAfterStart) end: string;
	@IsString() @IsNotEmpty() trade: string;
	@IsUUID() @IsNotEmpty() workplaceId: string;
}

export class ClaimShiftDto {
	@IsUUID() @IsNotEmpty() workerId: string;
}
