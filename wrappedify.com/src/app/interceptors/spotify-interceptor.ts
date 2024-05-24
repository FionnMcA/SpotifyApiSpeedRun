import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
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
        return next.handle(request);
      })
    );
  }
}
