import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { app } from '../../../server';
import { response } from 'express';
import { Observable } from 'rxjs';
import { platform } from 'os';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'], // Changed to 'styleUrls' and is an array
})
export class ResultsComponent implements OnInit {
  constructor(private route: ActivatedRoute, private http: HttpClient) {}
  trackUris: any[] = [];
  tracks: any[] = [];
  artists: any[] = [];
  timePeriod = 'long_term';
  user: any;
  expirationTime = 3600 * 1000;

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

  getTopArtists(): void {
    const url = `https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${this.timePeriod}`;

    this.http.get(url, {}).subscribe({
      next: (data: any) => {
        this.artists = data.items.slice(0, 5);
      },
      error: (error) => {
        console.log('error fetching top artists ', this.artists);
      },
    });
  }

  getTopTracks(): void {
    const url = `https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${this.timePeriod}`;
    this.http.get(url, {}).subscribe({
      next: (data: any) => {
        this.trackUris = data.items.map((item: any) => item.uri);
        console.log('Top Tracks:', data.items);
        this.tracks = data.items.slice(0, 5);
      },
      error: (error) => {
        console.error('Error fetching top tracks:', error);
      },
    });
  }

  onCreatePlaylist() {
    const description = this.timePeriod;
    const name = `Your top tracks of ${this.timePeriod}`;
    const accessToken = sessionStorage.getItem('accessToken');
    this.getProfile().subscribe({
      next: (userProfile) => {
        const userId = userProfile.id;
        this.createEmptyPlaylist(userId, name, description).subscribe({
          next: (playlist) => {
            const playlistId = playlist.id;
            this.addTracksToPlaylist(playlistId, this.trackUris);
          },
          error: (error) => {
            console.error('Error creating playlist ', error);
          },
        });
      },
      error: (error) => {
        console.error('Error getting profile ', error);
      },
    });
  }

  getProfile(): Observable<any> {
    const url = 'https://api.spotify.com/v1/me';
    return this.http.get(url, {});
  }

  createEmptyPlaylist(userId, name, description): Observable<any> {
    const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
    return this.http.post(url, {
      name: name,
      description: description,
      public: true,
    });
  }

  addTracksToPlaylist(playlistId, trackUris) {
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    this.http.post(url, { uris: trackUris }, {}).subscribe({
      next: (response) => console.log('Tracks added successfully ' + response),
      error: (error) => console.error('error adding tracks ' + error),
    });
  }
}
