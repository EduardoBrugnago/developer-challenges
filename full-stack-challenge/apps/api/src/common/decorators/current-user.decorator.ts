import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { AuthenticatedRequest, JwtPayload } from "../types/auth.types";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload =>
    ctx.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
