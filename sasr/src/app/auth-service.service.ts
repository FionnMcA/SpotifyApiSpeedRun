import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

  expirationTime = 3600 * 1000;

  refreshAccessToken(refreshToken: string): Observable<any> {
    return this.http.get(
      `https://spotify-api-speed-run-9b86.vercel.app/refresh_token?refresh_token=${refreshToken}`
    );
  }

  getAccessToken() {
    if (this.hasTokenExpired()) {
      this.handleTokenRefresh();
    }
    const access_token = sessionStorage.getItem('accessToken');
    return access_token;
  }

  handleTokenRefresh() {
    const refreshToken = sessionStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.error('No refresh token available');
      this.router.navigate(['/']);
      return;
    }

    this.refreshAccessToken(refreshToken).subscribe({
      next: (data) => {
        this.setSessionTokens(data);
      },
      error: (error) => {
        console.error('Error refreshing token:', error);
      },
    });
  }

  HandleHash() {
    const hash = window.location.hash.substring(1);
    if (hash) {
      const tokens = this.parseFragment(hash);
      this.setSessionTokens(tokens);
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
    const fiveMinutesInMs = 300000;
    return currentTime + fiveMinutesInMs > expirationTimestamp;
  }

  private setSessionTokens(tokens: TokenResponse): void {
    sessionStorage.setItem('accessToken', tokens.access_token);
    sessionStorage.setItem('refreshToken', tokens.refresh_token);
    const expirationTimestamp = new Date(
      Date.now() + this.expirationTime
    ).getTime();
    sessionStorage.setItem(
      'spotifyAccessTokenExpirationTimestamp',
      expirationTimestamp.toString()
    );
    console.log('expirationTimestamp ' + expirationTimestamp);
  }

  private parseFragment(fragment: string): TokenResponse {
    const params = new URLSearchParams(fragment);
    const access_token = params.get('access_token') || '';
    const refresh_token = params.get('refresh_token') || '';
    const expires_in = parseInt(params.get('expires_in') || '0', 10);
    return { access_token, refresh_token, expires_in };
  }
}
