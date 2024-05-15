import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable, observable } from 'rxjs';

@Injectable()
export class SpotifyInterceptor implements HttpInterceptor {
  accessToken = sessionStorage.getItem('accessToken');
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const requestWithToken = request.clone({
      headers: request.headers.set(
        'Authorization',
        `Bearer ${this.accessToken}`
      ),
    });
    return next.handle(requestWithToken);
  }
}
