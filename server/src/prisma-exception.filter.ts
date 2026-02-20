import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Prisma } from "@prisma/client";

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
	catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
		const response = host.switchToHttp().getResponse();
		if (exception.code === "P2025") {
			return response.status(HttpStatus.NOT_FOUND).json({
				statusCode: 404,
				message: "Not found",
			});
		}
		return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
			statusCode: 500,
			message: "Internal server error",
		});
	}
}
