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

  refreshAccessToken(refreshToken: string): Observable<any> {
    return this.http.get(
      `https://spotify-api-speed-run-9b86.vercel.app/refresh_token?refresh_token=${refreshToken}`
    );
  }

  getAccessToken() {
    const accessToken = sessionStorage.getItem('accessToken');
    const expired = this.hasTokenExpired();

    if (expired) {
      console.log('Access token expired. Attempting to refresh.');
      this.handleTokenRefresh();
    }

    return accessToken;
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
        if (data.access_token && data.refresh_token) {
          this.setSessionTokens(data);
        } else {
          console.error('Invalid token response:', data);
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        console.error('Error refreshing token:', error);
        this.router.navigate(['/']);
      },
    });
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
