import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateWorkplaceDto } from "./workplaces.dto";

@Injectable()
export class WorkplacesService {
	constructor(private readonly prisma: PrismaService) {}

	create(dto: CreateWorkplaceDto) {
		return this.prisma.workplace.create({ data: dto });
	}

	findOne(id: string) {
		return this.prisma.workplace.findUniqueOrThrow({ where: { id } });
	}

	findAll(take?: number, skip?: number) {
		return this.prisma.workplace.findMany({ take, skip, orderBy: { createdAt: "asc" } });
	}
}
