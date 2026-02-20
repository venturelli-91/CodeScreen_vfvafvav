import { Controller, Get, Post, Param, Body, Query } from "@nestjs/common";
import { ShiftsService } from "./shifts.service";
import { CreateShiftDto, ClaimShiftDto } from "./shifts.dto";

@Controller("shifts")
export class ShiftsController {
	constructor(private readonly service: ShiftsService) {}

	@Post()
	create(@Body() dto: CreateShiftDto) {
		return this.service.create(dto);
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.service.findOne(id);
	}

	@Post(":id/claim")
	claim(@Param("id") id: string, @Body() dto: ClaimShiftDto) {
		return this.service.claim(id, dto.workerId);
	}

	@Post(":id/cancel")
	cancel(@Param("id") id: string) {
		return this.service.cancel(id);
	}

	@Get()
	findAll(@Query("limit") limit?: string, @Query("skip") skip?: string) {
		return this.service.findAll(limit ? +limit : undefined, skip ? +skip : undefined);
	}
}
