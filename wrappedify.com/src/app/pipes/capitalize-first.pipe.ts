import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalizeFirst',
})
export class CapitalizeFirstPipe implements PipeTransform {
  //Spotify returns the genre in all lowercase, but the first letter
  //of the genre needs to be a capital to match Spotify's wrapped up cards

  //This pipe was the only solution I could think of
  transform(value: string, ...args: unknown[]): unknown {
    if (!value) return value;
    //Basically chop the Genre string into a first letter and the remaining
    //letters and add them together then
    //but on the first letter we're changing it to upper case
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
