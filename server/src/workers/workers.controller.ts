import {
	BadRequestException,
	Controller,
	Get,
	Post,
	Param,
	Body,
	Query,
} from "@nestjs/common";
import { WorkersService } from "./workers.service";
import { CreateWorkerDto } from "./workers.dto";

@Controller("workers")
export class WorkersController {
	constructor(private readonly service: WorkersService) {}

	@Post()
	create(@Body() dto: CreateWorkerDto) {
		return this.service.create(dto);
	}

	@Get("claims")
	claims(@Query("workerId") workerId?: string) {
		if (!workerId) throw new BadRequestException("workerId is required");
		return this.service.claims(workerId);
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.service.findOne(id);
	}

	@Get()
	findAll(@Query("limit") limit?: string, @Query("skip") skip?: string) {
		return this.service.findAll(
			limit ? +limit : undefined,
			skip ? +skip : undefined,
		);
	}
}
