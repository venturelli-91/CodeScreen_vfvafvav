import {
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
import { WorkplacesService } from "./workplaces.service";
import { CreateWorkplaceDto, UpdateWorkplaceDto } from "./workplaces.dto";

@Controller("workplaces")
export class WorkplacesController {
	constructor(private readonly service: WorkplacesService) {}

	@Post()
	create(@Body() dto: CreateWorkplaceDto) {
		return this.service.create(dto);
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
	update(@Param("id") id: string, @Body() dto: UpdateWorkplaceDto) {
		return this.service.update(id, dto);
	}

	@Delete(":id")
	@HttpCode(204)
	remove(@Param("id") id: string) {
		return this.service.remove(id);
	}
}
