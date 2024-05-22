import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  constructor(private http: HttpClient, private router: Router) {}

  refreshAccessToken(refreshToken: string): Observable<any> {
    const body = new URLSearchParams({
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    return this.http.post(
      `https://spotify-api-speed-run-9b86.vercel.app/refresh_token`,
      body.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
  }

  getAccessToken(): Observable<string> {
    if (!this.hasTokenExpired()) {
      return of(sessionStorage.getItem('accessToken'));
    }
    return this.handleTokenRefresh().pipe(
      switchMap(() => of(sessionStorage.getItem('accessToken'))),
      catchError((error) => {
        console.log('Error during refresh ', error);
        this.router.navigate(['/']);
        return of(null);
      })
    );
  }

  handleTokenRefresh(): Observable<any> {
    const refreshToken = sessionStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.error('No refresh token available');
      this.router.navigate(['/']);
      return of(null); // Return an Observable that emits `null`
    }

    return this.refreshAccessToken(refreshToken).pipe(
      tap((data) => {
        if (data.access_token && data.refresh_token) {
          this.setSessionTokens(data);
        } else {
          console.error('Invalid token response:', data);
          this.router.navigate(['/']);
        }
      }),
      catchError((error) => {
        console.error('Error refreshing token:', error);
        this.router.navigate(['/']);
        return of(null); // Handle error by returning an Observable that emits `null`
      })
    );
  }

  handleHash() {
    const hash = window.location.hash.substring(1);
    if (hash) {
      const tokens = this.parseFragment(hash);
      if (tokens.access_token && tokens.refresh_token) {
        this.setSessionTokens(tokens);
      } else {
        console.error('Invalid token fragments:', hash);
      }
      history.replaceState(
        null,
        null,
        window.location.pathname + window.location.search
      );
    }
  }

  getExpirationTimestamp(): number {
    const timestamp = sessionStorage.getItem(
      'spotifyAccessTokenExpirationTimestamp'
    );
    return timestamp ? parseInt(timestamp, 10) : 0;
  }

  hasTokenExpired(): boolean {
    const currentTime = Date.now();
    const expirationTimestamp = this.getExpirationTimestamp();
    const fiveMinutesInMs = 300000; // 5 minutes buffer
    const expired = currentTime + fiveMinutesInMs > expirationTimestamp;
    console.log(`Token expired: ${expired}`);
    return expired;
  }

  private setSessionTokens(tokens: TokenResponse): void {
    sessionStorage.setItem('accessToken', tokens.access_token);
    sessionStorage.setItem('refreshToken', tokens.refresh_token);
    const expirationTimestamp = Date.now() + tokens.expires_in * 1000;
    sessionStorage.setItem(
      'spotifyAccessTokenExpirationTimestamp',
      expirationTimestamp.toString()
    );
    console.log(
      'Access token and refresh token set. Expiration timestamp:',
      expirationTimestamp
    );
  }

  private parseFragment(fragment: string): TokenResponse {
    const params = new URLSearchParams(fragment);
    const access_token = params.get('access_token') || '';
    const refresh_token = params.get('refresh_token') || '';
    const expires_in = parseInt(params.get('expires_in') || '0', 10);
    return { access_token, refresh_token, expires_in };
  }
}
