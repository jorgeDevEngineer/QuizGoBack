import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class FakeCurrentUserGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();


    const rawUserId =
      (req.headers["x-debug-user-id"] as string | undefined) ??
      (req.query["debugUserId"] as string | undefined);

    if (!rawUserId) {
      throw new Error(
        "Missing x-debug-user-id header (fake auth for dev/testing)",
      );
    }

    //Simular req.user como lo haría un JWT guard
    (req as any).user = {
      id: rawUserId,
    };

    return true;
  }
}