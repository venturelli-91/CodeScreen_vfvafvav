import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	await prisma.shift.deleteMany();
	await prisma.worker.deleteMany();
	await prisma.workplace.deleteMany();

	const wp1 = await prisma.workplace.create({
		data: { name: "Olympus Base", address: "1 Olympus Mons, Mars" },
	});
	const wp2 = await prisma.workplace.create({
		data: { name: "Valles Hub", address: "42 Valles Marineris, Mars" },
	});

	const w1 = await prisma.worker.create({
		data: { name: "Ares Smith", trade: "Welder" },
	});
	const w2 = await prisma.worker.create({
		data: { name: "Nova Jones", trade: "Engineer" },
	});

	const now = new Date();
	const h = (n: number) => new Date(now.getTime() + n * 3600000);

	await prisma.shift.createMany({
		data: [
			{ start: h(1), end: h(9), trade: "Welder", workplaceId: wp1.id },
			{ start: h(2), end: h(10), trade: "Engineer", workplaceId: wp2.id },
			{
				start: h(3),
				end: h(11),
				trade: "Welder",
				workplaceId: wp2.id,
				workerId: w1.id,
			},
			{
				start: h(5),
				end: h(13),
				trade: "Engineer",
				workplaceId: wp1.id,
				workerId: w2.id,
			},
		],
	});

	console.log("Seed done");
}

main()
	.catch(console.error)
	.finally(() => prisma.$disconnect());
