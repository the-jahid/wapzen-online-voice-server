import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthenticatedRequest } from "./auth.types";

export const CurrentUser = createParamDecorator(
    (_data:unknown, ctx: ExecutionContext): string => {
        const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>()
        return req.auth.clerkUserId
    }
)



