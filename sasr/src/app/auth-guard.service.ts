import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs'; // Import 'of' for Observable creation
import { catchError, map } from 'rxjs/operators';
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
        if (token) {
          return true;
        }
        this.router.navigate(['/login']);
        return false;
      }),
      catchError((error) => {
        console.log('Error during token validation:', error);
        this.router.navigate(['/']);
        return of(false);
      })
    );
  }
}
