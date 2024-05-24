import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ellipsis',
})
export class EllipsisPipe implements PipeTransform {
  //Didn't like css elipsis styling so I made a pipe for it
  transform(value: string, max: number = 16): string {
    if (!value) return value;
    //If the string is 16 or more charcters only return the first 13
    //letters of the string followed by an ellipsis '...'
    if (value.length > max) {
      return value.substring(0, 13) + '...';
    }
    return value;
  }
}
