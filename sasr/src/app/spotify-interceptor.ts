import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable, observable } from 'rxjs';
import { AuthServiceService } from './auth-service.service';

@Injectable()
export class SpotifyInterceptor implements HttpInterceptor {
  constructor(private authService: AuthServiceService) {}
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const accessToken = this.authService.getAccessToken();
    const requestWithToken = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${accessToken}`),
    });
    return next.handle(requestWithToken);
  }
}
