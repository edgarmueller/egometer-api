import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { createMock } from '@golevelup/nestjs-testing';
import { ContentType, ContentTypeGuard } from "./content-type.guard";
import { UnsupportedMediaTypeException } from '@nestjs/common';

describe('ContentTypeGuard', () => {
  let guard: ContentTypeGuard;

  beforeEach(() => {
    guard = ContentType('application/json');
  });

  it('should be defined', () => {
    expect(guard).toBeInstanceOf(ContentTypeGuard);
  });

  it('should activate if no content type given', () => {
    const context = createMock<ExecutionContextHost>();
    expect(guard.canActivate(context)).toBeTruthy();
  });

  it('should activate if content-type matches', () => {
    const context = createMock<ExecutionContextHost>({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'content-type': 'application/json'
          }
        })
      })
    });
    expect(guard.canActivate(context)).toBeTruthy();
  });

  it('should activate if content-type matches, but with charset given', () => {
    const context = createMock<ExecutionContextHost>({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'content-type': 'application/json; charset=utf-8'
          }
        })
      })
    });
    expect(guard.canActivate(context)).toBeTruthy();
  });

  it('should NOT activate if content-type is text/plain', () => {
    const context = createMock<ExecutionContextHost>({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'content-type': 'text/plain'
          }
        })
      })
    });
    expect(() => guard.canActivate(context)).toThrow(UnsupportedMediaTypeException);
  });
});