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

    console.log('Sending refresh token request with:', body.toString());

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
    const accessToken = sessionStorage.getItem('accessToken');
    const refreshToken = sessionStorage.getItem('refreshToken');
    const isExpired = this.hasTokenExpired();

    if (!isExpired && accessToken) {
      return of(accessToken);
    } else if (refreshToken) {
      return this.handleTokenRefresh().pipe(
        switchMap(() => {
          const updatedToken = sessionStorage.getItem('accessToken');
          return updatedToken ? of(updatedToken) : of(null);
        }),
        catchError((error) => {
          console.error('Error during token refresh:', error);
          this.router.navigate(['/']);
          return of(null);
        })
      );
    } else {
      console.error('No refresh token available');
      this.router.navigate(['/']);
      return of(null);
    }
  }

  handleTokenRefresh(): Observable<any> {
    const refreshToken = sessionStorage.getItem('refreshToken');
    return this.refreshAccessToken(refreshToken).pipe(
      tap((data) => {
        if (data.access_token && data.refresh_token) {
          this.setSessionTokens(data);
        } else {
          console.error('Invalid token data received:', data);
          throw new Error('Invalid token data');
        }
      }),
      catchError((error) => {
        console.error('Failed to refresh token:', error);
        this.router.navigate(['/']);
        return of(null);
      })
    );
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

  private parseFragment(fragment: string): TokenResponse {
    const params = new URLSearchParams(fragment);
    const access_token = params.get('access_token') || '';
    const refresh_token = params.get('refresh_token') || '';
    const expires_in = parseInt(params.get('expires_in') || '0', 10);
    return { access_token, refresh_token, expires_in };
  }

  private setSessionTokens(tokens: TokenResponse): void {
    const currentTime = Date.now();
    const expiresInSeconds = tokens.expires_in > 0 ? tokens.expires_in : 3600;
    const expirationTimestamp = currentTime + expiresInSeconds * 1000;

    console.log(`Current time: ${currentTime}`);
    console.log(`Expires in (seconds): ${expiresInSeconds}`);
    console.log(`Calculated expiration time: ${expirationTimestamp}`);

    sessionStorage.setItem('accessToken', tokens.access_token);
    sessionStorage.setItem('refreshToken', tokens.refresh_token);
    sessionStorage.setItem(
      'spotifyAccessTokenExpirationTimestamp',
      expirationTimestamp.toString()
    );

    console.log(
      `Access token and refresh token set. Expiration timestamp: ${new Date(
        expirationTimestamp
      ).toLocaleString()}`
    );
  }
}
