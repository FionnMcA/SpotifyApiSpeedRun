import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  constructor() {}

  expirationTime = 3600 * 1000;

  HandleHash() {
    const hash = window.location.hash.substring(1);
    if (hash) {
      const tokens = this.parseFragment(hash);
      if (tokens.access_token && tokens.refresh_token) {
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
    return currentTime > expirationTimestamp;
  }

  private parseFragment(fragment: string): any {
    const params = new URLSearchParams(fragment);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    return { access_token, refresh_token };
  }
}
