import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthServiceService } from '../auth-service.service';
import { MenuItem } from 'primeng/api';
@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'],
})
export class ResultsComponent implements OnInit {
  trackUris: any[] = [];
  tracks: any[] = [];
  artists: any[] = [];
  timePeriod = 'long_term';
  formattedDate: string;
  loading: boolean = true;
  topArtistImg: string;
  items: MenuItem[] | undefined;
  activeItem: MenuItem | undefined;
  playlistUrl: string;
  isClicked = false;
  colours: string[] = ['green', 'red', 'blue', 'orange'];
  playlistString = 'Create Playlist';
  averageMins: number = 0;
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthServiceService,
    private datePipe: DatePipe
  ) {
    this.formattedDate = this.datePipe.transform(new Date(), 'dd-MM-yyyy');

    console.log('FOrmatted date ' + this.formattedDate);
    this.items = [
      {
        label: '4 weeks',
        command: () => this.onChangeTimePeriod('short_term'),
      },
      {
        label: '6 months',
        command: () => this.onChangeTimePeriod('medium_term'),
      },
      {
        label: 'All time',
        command: () => this.onChangeTimePeriod('long_term'),
      },
    ];
    this.activeItem = this.items[2];
  }

  timePeriodToString(timePeriod: string): string {
    switch (timePeriod) {
      case 'short_term':
        return '4 Weeks';
      case 'medium_term':
        return '6 Months';
      case 'long_term':
        return 'Year';
    }
  }

  ngOnInit(): void {
    this.authService.handleHash();
    this.getTopTracks();
    this.getTopArtists();
  }

  onChangeTimePeriod(timePeriod: string): void {
    this.timePeriod = timePeriod;
    console.log('Time Period: ', this.timePeriod);
    this.getTopTracks();
    this.getTopArtists();
  }

  getTopArtists(): void {
    const url = `https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${this.timePeriod}`;

    this.http.get(url, {}).subscribe({
      next: (data: any) => {
        this.topArtistImg = data.items[0].images[0].url;
        this.artists = data.items.slice(0, 5);
      },
      error: (error) => {
        console.log('error fetching top artists ', this.artists);
      },
    });
  }

  getRecentlyPlayed(): void {
    const url = `https://api.spotify.com/v1/me/player/recently-played?limit=50`;

    this.http.get(url, {}).subscribe({
      next: (data: any) => {
        const totalMins = this.getTotalMinutes(data);
        const timeSpan = this.getSpan(data);
        this.averageMins = Math.round(
          (totalMins / timeSpan) * this.timePeriodToInt(this.timePeriod)
        );
      },
      error: (error) => {
        console.log('error fetching recently played');
      },
    });
  }

  msToMins(milliseconds: number): number {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = (milliseconds % 60000) / 1000;
    const totalMinutes = minutes + seconds / 60;

    return totalMinutes;
  }

  getTotalMinutes(recentPlays: any[]): number {
    const totalMins = recentPlays.reduce(
      (total, track) => total + this.msToMins(track.track.duration_ms),
      0
    );
    return totalMins;
  }

  getSpan(recentPlays: any[]): number {
    if (recentPlays.length > 0) {
      const firstPlayed = new Date(recentPlays[0].played_at);
      const lastPlayed = new Date(
        recentPlays[recentPlays.length - 1].played_at
      );

      const timeSpan =
        (firstPlayed.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24);
      return timeSpan;
    }
    return 0;
  }

  getTopTracks(): void {
    const url = `https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${this.timePeriod}`;
    this.http.get(url, {}).subscribe({
      next: (data: any) => {
        this.trackUris = data.items.map((item: any) => item.uri);
        console.log('Top Tracks:', data.items);
        this.tracks = data.items.slice(0, 5);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching top tracks:', error);
      },
    });
  }

  timePeriodToInt(timePeriod: string): number {
    switch (timePeriod) {
      case 'short_term':
        return 28;
      case 'medium_term':
        return 182.5;
      case 'long_term':
        return 365;
    }
  }

  onCreatePlaylist() {
    if (this.playlistString === 'Create Playlist') {
      const description = this.timePeriod;
      const name = `Your top tracks of ${this.timePeriod}`;
      this.getProfile().subscribe({
        next: (userProfile) => {
          const userId = userProfile.id;
          this.createEmptyPlaylist(userId, name, description).subscribe({
            next: (playlist) => {
              this.playlistUrl = playlist.external_urls.spotify;
              this.playlistString = 'View Playlist';
              this.isClicked = true;
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
    } else {
      this.isClicked = false;
      this.playlistString = 'Create Playlist';
      window.location.href = this.playlistUrl;
    }
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
