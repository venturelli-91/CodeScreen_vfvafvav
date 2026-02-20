import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateShiftDto } from "./shifts.dto";

@Injectable()
export class ShiftsService {
	constructor(private readonly prisma: PrismaService) {}

	create(dto: CreateShiftDto) {
		return this.prisma.shift.create({
			data: {
				start: new Date(dto.start),
				end: new Date(dto.end),
				trade: dto.trade,
				workplaceId: dto.workplaceId,
			},
		});
	}

	findOne(id: string) {
		return this.prisma.shift.findUniqueOrThrow({
			where: { id },
			include: { workplace: true, worker: true },
		});
	}

	findAll(take?: number, skip?: number) {
		return this.prisma.shift.findMany({
			include: { workplace: true, worker: true },
			orderBy: { createdAt: "asc" },
			take,
			skip,
		});
	}

	async claim(id: string, workerId: string) {
		const worker = await this.prisma.worker.findUniqueOrThrow({ where: { id: workerId } });
		return this.prisma.$transaction(async (tx) => {
			const shift = await tx.shift.findUniqueOrThrow({ where: { id } });
			if (shift.workerId) throw new BadRequestException("Shift already claimed");
			if (shift.cancelled) throw new BadRequestException("Shift is cancelled");
			if (shift.trade !== worker.trade)
				throw new BadRequestException("Worker trade does not match shift trade");
			return tx.shift.update({
				where: { id },
				data: { workerId },
				include: { workplace: true, worker: true },
			});
		});
	}

	async cancel(id: string) {
		const shift = await this.prisma.shift.findUniqueOrThrow({ where: { id } });
		if (shift.cancelled)
			throw new BadRequestException("Shift already cancelled");
		if (!shift.workerId)
			throw new BadRequestException("Shift is not claimed");
		return this.prisma.shift.update({
			where: { id },
			data: { workerId: null, cancelled: true },
		});
	}
}
