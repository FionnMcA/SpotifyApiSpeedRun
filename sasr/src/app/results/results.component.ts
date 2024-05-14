import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'], // Changed to 'styleUrls' and is an array
})
export class ResultsComponent implements OnInit {
  constructor(private route: ActivatedRoute, private http: HttpClient) {}
  tracks: any[] = [];
  artists: any[] = [];
  timePeriod = 'long_term';
  userId: any;

  ngOnInit(): void {
    this.HandleHash();
    this.getTopTracks();
    this.getTopArtists();
    this.getProfile();
  }

  on4Weeks() {
    this.timePeriod = 'short_term';
    this.getTopTracks();
    this.getTopArtists();
  }
  on6Months() {
    this.timePeriod = 'medium_term';
    this.getTopTracks();
    this.getTopArtists();
  }
  on1Year() {
    this.timePeriod = 'long_term';
    this.getTopTracks();
    this.getTopArtists();
  }

  HandleHash() {
    const hash = window.location.hash.substring(1);
    if (hash) {
      const tokens = this.parseFragment(hash);
      if (tokens.access_token && tokens.refresh_token) {
        sessionStorage.setItem('accessToken', tokens.access_token);
        sessionStorage.setItem('refreshToken', tokens.refresh_token);
      }
      history.replaceState(
        null,
        null,
        window.location.pathname + window.location.search
      );
    }
  }

  private parseFragment(fragment: string): any {
    const params = new URLSearchParams(fragment);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    return { access_token, refresh_token };
  }

  getTopArtists(): void {
    const accessToken = sessionStorage.getItem('accessToken');
    const url = `https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${this.timePeriod}`;

    this.http
      .get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .subscribe({
        next: (data: any) => {
          this.artists = data.items.slice(0, 5);
        },
        error: (error) => {
          console.log('error fetching top artists ', this.artists);
        },
      });
  }

  getTopTracks(): void {
    const accessToken = sessionStorage.getItem('accessToken');
    const url = `https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${this.timePeriod}`;

    this.http
      .get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .subscribe({
        next: (data: any) => {
          console.log('Top Tracks:', data.items);
          this.tracks = data.items.slice(0, 5);
        },
        error: (error) => {
          console.error('Error fetching top tracks:', error);
        },
      });
  }

  getProfile() {
    const access_token = sessionStorage.getItem('access_token');
    const url = 'https://api.spotify.com/v1/me';
    this.http
      .get(url, {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      .subscribe({
        next: (data: any) => {
          this.userId = data.items.id;
          console.log('UserId ' + this.userId);
        },
        error: (error) => {
          console.error('error geting user profile ', error);
        },
      });
  }
}
