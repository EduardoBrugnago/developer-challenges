import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { Response } from "express";

const PRISMA_ERROR_MAP: Record<
  string,
  { status: HttpStatus; message: string }
> = {
  P2002: {
    status: HttpStatus.CONFLICT,
    message: "A record with the same unique value already exists",
  },
  P2003: {
    status: HttpStatus.BAD_REQUEST,
    message: "Related record does not exist",
  },
  P2025: { status: HttpStatus.NOT_FOUND, message: "Record not found" },
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const mapped = PRISMA_ERROR_MAP[exception.code];

    if (!mapped) {
      this.logger.error(
        `Unhandled Prisma error ${exception.code}`,
        exception.stack,
      );
    }

    const status = mapped?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const target = (exception.meta?.target as string[] | undefined)?.join(", ");

    response.status(status).json({
      statusCode: status,
      message: mapped
        ? `${mapped.message}${target ? ` (${target})` : ""}`
        : "Unexpected database error",
      error: exception.code,
    });
  }
}
