import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AuthServiceService } from '../services/auth-service.service';

@Injectable()
export class SpotifyInterceptor implements HttpInterceptor {
  constructor(private authService: AuthServiceService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return this.authService.getAccessToken().pipe(
      switchMap((token) => {
        if (token) {
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
        return next.handle(request).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
              // If we get a 401 unauthorized response, attempt to refresh the token
              return this.authService.getAccessToken().pipe(
                switchMap((newToken) => {
                  if (newToken) {
                    request = request.clone({
                      setHeaders: {
                        Authorization: `Bearer ${newToken}`,
                      },
                    });
                    return next.handle(request);
                  } else {
                    return throwError(error);
                  }
                })
              );
            }
            return throwError(error);
          })
        );
      })
    );
  }
}
