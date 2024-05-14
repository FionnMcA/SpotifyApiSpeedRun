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
          this.trackUris = data.items.uri;
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
    this.getProfile(accessToken).subscribe({
      next: (userProfile) => {
        const userId = userProfile.id;
        this.createEmptyPlaylist(
          accessToken,
          userId,
          name,
          description
        ).subscribe({
          next: (playlist) => {
            const playlistId = playlist.id;
            this.addTracksToPlaylist(accessToken, playlistId, this.trackUris);
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

  getProfile(accessToken): Observable<any> {
    const url = 'https://api.spotify.com/v1/me';
    return this.http.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  createEmptyPlaylist(accessToken, userId, name, description): Observable<any> {
    const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
    return this.http.post(
      url,
      {
        name: name,
        description: description,
        public: true,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  }

  addTracksToPlaylist(accessToken, playlistId, trackUris) {
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

    this.http
      .post(
        url,
        { uris: trackUris },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      .subscribe({
        next: (response) =>
          console.log('Tracks added successfully ' + response),
        error: (error) => console.error('error adding tracks ' + error),
      });
  }
}
