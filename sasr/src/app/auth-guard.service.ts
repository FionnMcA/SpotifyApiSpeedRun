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
      map((token) => {
        if (token !== null) {
          return true;
        } else {
          this.router.navigate(['/']);
          return false;
        }
      }),
      catchError((error) => {
        console.error('Error during token validation:', error);
        this.router.navigate(['/']);
        return of(false);
      })
    );
  }
}
