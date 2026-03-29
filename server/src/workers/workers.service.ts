import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateWorkerDto, UpdateWorkerDto } from "./workers.dto";

@Injectable()
export class WorkersService {
	constructor(private readonly prisma: PrismaService) {}

	create(dto: CreateWorkerDto) {
		return this.prisma.worker.create({ data: dto });
	}

	findOne(id: string) {
		return this.prisma.worker.findUniqueOrThrow({ where: { id } });
	}

	findAll(take?: number, skip?: number) {
		return this.prisma.worker.findMany({
			take,
			skip,
			orderBy: { createdAt: "asc" },
		});
	}

	claims(workerId: string) {
		return this.prisma.shift.findMany({
			where: { workerId },
			include: { workplace: true },
			orderBy: { createdAt: "asc" },
		});
	}

	update(id: string, dto: UpdateWorkerDto) {
		return this.prisma.worker.update({ where: { id }, data: dto });
	}

	/** Unassigns the worker from all shifts before deleting. */
	async remove(id: string) {
		await this.prisma.$transaction([
			this.prisma.shift.updateMany({
				where: { workerId: id },
				data: { workerId: null },
			}),
			this.prisma.worker.delete({ where: { id } }),
		]);
	}
}
