import { Controller, Get, Post, Param, Body, Query } from "@nestjs/common";
import { WorkplacesService } from "./workplaces.service";
import { CreateWorkplaceDto } from "./workplaces.dto";

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
		return this.service.findAll(limit ? +limit : undefined, skip ? +skip : undefined);
	}
}
