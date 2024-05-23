import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalizeFirst',
})
export class CapitalizeFirstPipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): unknown {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
