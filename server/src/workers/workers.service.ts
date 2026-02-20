import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateWorkerDto } from "./workers.dto";

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
		return this.prisma.worker.findMany({ take, skip, orderBy: { createdAt: "asc" } });
	}

	claims(workerId: string) {
		return this.prisma.shift.findMany({
			where: { workerId },
			include: { workplace: true },
			orderBy: { createdAt: "asc" },
		});
	}
}
