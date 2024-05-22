import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap, catchError, tap, map } from 'rxjs/operators';
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
      `https://spotify-api-speed-run-9b86.vercel.app/api/refresh`,
      body.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
  }

  getAccessToken(): Observable<string | null> {
    const refreshToken = sessionStorage.getItem('refreshToken');
    const accessToken = sessionStorage.getItem('accessToken');
    const expired = this.hasTokenExpired();

    if (!expired && accessToken) {
      return of(accessToken);
    } else if (refreshToken) {
      return this.handleTokenRefresh();
    } else {
      // this.router.navigate(['/login']);
      return of(null);
    }
  }

  handleTokenRefresh(): Observable<string | null> {
    const refreshToken = sessionStorage.getItem('refreshToken');
    if (!refreshToken) {
      return of(null);
    }

    return this.refreshAccessToken(refreshToken).pipe(
      tap((data) => this.setSessionTokens(data)),
      map((data) => data.access_token),
      catchError((error) => {
        console.error('Error refreshing token:', error);
        // this.router.navigate(['/login']);
        return of(null);
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
    const bufferTime = 60000;
    const hasExpired = currentTime > expirationTimestamp - bufferTime;
    console.log(
      `Token expired: ${hasExpired}, Current time: ${currentTime}, Expiration time with buffer: ${
        expirationTimestamp - bufferTime
      }`
    );
    return hasExpired;
  }

  private setSessionTokens(tokens: TokenResponse): void {
    const currentTime = Date.now();
    const defaultExpiresIn = 3600;
    const expiresInSeconds =
      tokens.expires_in > 0 ? tokens.expires_in : defaultExpiresIn;
    const expirationTimestamp = currentTime + expiresInSeconds * 1000;
    sessionStorage.setItem('accessToken', tokens.access_token);
    sessionStorage.setItem('refreshToken', tokens.refresh_token);
    sessionStorage.setItem(
      'spotifyAccessTokenExpirationTimestamp',
      expirationTimestamp.toString()
    );
    console.log(
      `Tokens set at ${new Date(
        currentTime
      ).toLocaleString()} with expiration at ${new Date(
        expirationTimestamp
      ).toLocaleString()}, expires in: ${expiresInSeconds} seconds`
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
