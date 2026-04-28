import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

@Injectable()
export class FechaFiltroPipe implements PipeTransform {
  transform(value: unknown): string | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value !== 'string' || !ISO_DATE.test(value)) {
      throw new BadRequestException('La fecha debe tener formato YYYY-MM-DD');
    }
    return value;
  }
}
