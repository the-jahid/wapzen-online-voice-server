import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { AuthenticatedRequest } from "./auth.types";
import { verifyToken } from "@clerk/backend";


@Injectable()

export class ClerkAuthGuard implements CanActivate {

    constructor (
      private readonly reflector: Reflector,
      private readonly config: ConfigService
    ) {}

   async canActivate(context: ExecutionContext): Promise<boolean> {
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass()
      ])
      
      if(isPublic) return true

      // read bearer token from header
      const req = context.switchToHttp().getRequest<AuthenticatedRequest>()
      const header = req.headers.authorization
      if(!header?.startsWith('Bearer ')){
        throw new UnauthorizedException('Missing bearer token')
      }

      // verify the token with clerk public keys and attach the user id

      try {

        const payload = await verifyToken(header.slice(7), {
          secretKey: this.config.getOrThrow<string>('CLERK_SECRET_KEY'),
          authorizedParties: [this.config.getOrThrow<string>('FRONTEND_ORIGIN')]
        })

        req.auth = {clerkUserId: payload.sub}
        return true

      } catch (error) {
        throw new UnauthorizedException('Invalid or expired token')
      }
   }
}











