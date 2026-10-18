import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** The authenticated user, as set by the JWT strategy. */
export interface AuthUser {
  userId: string;
  email: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser =>
    context.switchToHttp().getRequest().user,
);
