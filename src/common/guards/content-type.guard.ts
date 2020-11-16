import {
  CanActivate,
  ExecutionContext,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { isEmpty } from 'class-validator';
import { parse } from 'content-type';

export const ContentType = (contentType: string) =>
  new ContentTypeGuard(contentType);

export class ContentTypeGuard implements CanActivate {
  constructor(readonly contentType: string) {}

  static fromString(contenType: string): ContentTypeGuard {
    return new ContentTypeGuard(contenType);
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | import('rxjs').Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const contentType = request.headers['content-type'];
    if (isEmpty(contentType)) {
      return true;
    }
    const { type } = parse(contentType);
    if (type === this.contentType) {
      return true;
    }
    throw new UnsupportedMediaTypeException();
  }
}
