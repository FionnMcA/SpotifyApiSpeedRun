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

  ngOnInit(): void {
    this.HandleHash();
    this.getTopTracks();
    this.getTopArtists();
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
        localStorage.setItem('accessToken', tokens.access_token);
        localStorage.setItem('refreshToken', tokens.refresh_token);
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
    const accessToken = localStorage.getItem('accessToken');
    const url = `https://api.spotify.com/v1/me/top/artists?limit=5&time_range=${this.timePeriod}`;

    this.http
      .get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .subscribe({
        next: (data: any) => {
          this.artists = data.items;
        },
        error: (error) => {
          console.log('error fetching top artists ', this.artists);
        },
      });
  }

  getTopTracks(): void {
    const accessToken = localStorage.getItem('accessToken');
    const url = `https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=${this.timePeriod}`;

    this.http
      .get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .subscribe({
        next: (data: any) => {
          console.log('Top Tracks:', data.items);
          this.tracks = data.items;
        },
        error: (error) => {
          console.error('Error fetching top tracks:', error);
        },
      });
  }
}
