import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateWorkplaceDto, UpdateWorkplaceDto } from "./workplaces.dto";

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
		return this.prisma.workplace.findMany({
			take,
			skip,
			orderBy: { createdAt: "asc" },
		});
	}

	update(id: string, dto: UpdateWorkplaceDto) {
		return this.prisma.workplace.update({ where: { id }, data: dto });
	}

	/** Prevents deletion if shifts exist for this workplace. */
	async remove(id: string) {
		const shiftCount = await this.prisma.shift.count({
			where: { workplaceId: id },
		});
		if (shiftCount > 0) {
			throw new ConflictException(
				`Cannot delete a workplace that has ${shiftCount} shift(s). Remove the shifts first.`,
			);
		}
		return this.prisma.workplace.delete({ where: { id } });
	}
}
