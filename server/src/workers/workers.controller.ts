import {
	BadRequestException,
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Param,
	Body,
	Query,
	HttpCode,
} from "@nestjs/common";
import { WorkersService } from "./workers.service";
import { CreateWorkerDto, UpdateWorkerDto } from "./workers.dto";

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

	@Patch(":id")
	update(@Param("id") id: string, @Body() dto: UpdateWorkerDto) {
		return this.service.update(id, dto);
	}

	@Delete(":id")
	@HttpCode(204)
	remove(@Param("id") id: string) {
		return this.service.remove(id);
	}
}
