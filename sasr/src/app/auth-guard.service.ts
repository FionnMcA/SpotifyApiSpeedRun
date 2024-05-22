import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
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
      map((token) => !!token),
      tap((isAuthenticated) => {
        if (!isAuthenticated) {
          this.router.navigate(['/login']);
        }
      }),
      catchError((error) => {
        console.error('Authentication error:', error);
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
