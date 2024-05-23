import { Pipe, PipeTransform } from '@angular/core';
import { max } from 'rxjs-compat/operator/max';

@Pipe({
  name: 'ellipsis',
})
export class EllipsisPipe implements PipeTransform {
  transform(value: string, max: number = 13): string {
    if (!value) return value;
    if (value.length > max) {
      return value.substring(0, max) + '...';
    }
  }
}
