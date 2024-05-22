import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  constructor(
    private authService: AuthServiceService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.getAccessToken().pipe(
      switchMap((token) => {
        console.log('Token received in Guard:', token);
        if (token) {
          return of(true);
        } else {
          this.router.navigate(['/login']);
          return of(false);
        }
      }),
      catchError((error) => {
        console.log('Error during token validation:', error);
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
