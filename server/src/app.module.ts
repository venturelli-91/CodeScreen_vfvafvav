import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma.module";
import { WorkersModule } from "./workers/workers.module";
import { WorkplacesModule } from "./workplaces/workplaces.module";
import { ShiftsModule } from "./shifts/shifts.module";

@Module({
	imports: [PrismaModule, WorkersModule, WorkplacesModule, ShiftsModule],
})
export class AppModule {}
