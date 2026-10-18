import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { registerDecorator, ValidationOptions } from 'class-validator';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Whether the value is an existing calendar date in YYYY-MM-DD format. */
export function isCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return !isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

/** Number of days from `from` to `to`, both YYYY-MM-DD. */
export function daysBetween(from: string, to: string): number {
  const ms =
    new Date(`${to}T00:00:00Z`).getTime() -
    new Date(`${from}T00:00:00Z`).getTime();
  return Math.round(ms / 86_400_000);
}

export function IsCalendarDate(options?: ValidationOptions) {
  return (object: object, propertyName: string) =>
    registerDecorator({
      name: 'isCalendarDate',
      target: object.constructor,
      propertyName,
      options: {
        message: `${propertyName} must be a date in YYYY-MM-DD format`,
        ...options,
      },
      validator: { validate: isCalendarDate },
    });
}

@Injectable()
export class ParseCalendarDatePipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!isCalendarDate(value)) {
      throw new BadRequestException('date must be in YYYY-MM-DD format');
    }
    return value;
  }
}
