import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthServiceService } from '../services/auth-service.service';
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
  topGenre: string;
  playlistLoading: boolean = false;
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
        label: '4 Weeks',
        command: () => this.onChangeTimePeriod('short_term'),
      },
      {
        label: '6 Months',
        command: () => this.onChangeTimePeriod('medium_term'),
      },
      {
        label: 'Year',
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
    this.getRecentlyPlayed();
  }

  onChangeTimePeriod(timePeriod: string): void {
    this.timePeriod = timePeriod;
    console.log('Time Period: ', this.timePeriod);
    this.getTopTracks();
    this.getTopArtists();
    this.getRecentlyPlayed();
  }

  getTopArtists(): void {
    const url = `https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${this.timePeriod}`;

    this.http.get(url, {}).subscribe({
      next: (data: any) => {
        let genreDict = {};
        data.items.forEach((artist) => {
          console.log(artist.genres);
          genreDict = this.addToGenreDict(artist.genres, genreDict);
        });
        const sortedGenres = Object.entries(genreDict).sort(
          (a: [string, number], b: [string, number]) => {
            return b[1] - a[1];
          }
        );
        this.topGenre = sortedGenres[0][0];
        this.topArtistImg = data.items[0].images[0].url;
        this.artists = data.items.slice(0, 5);
      },
      error: (error) => {
        console.log('error fetching top artists ', this.artists);
      },
    });
  }

  addToGenreDict(genres, genreDict) {
    genres.forEach((genre) => {
      genreDict[genre] = (genreDict[genre] || 0) + 1;
    });
    return genreDict;
  }

  getRecentlyPlayed(): void {
    const url = `https://api.spotify.com/v1/me/player/recently-played?limit=50`;

    this.http.get(url, {}).subscribe({
      next: (data: any) => {
        const totalMins = this.getTotalMinutes(data.items);
        console.log('totalMins ' + totalMins);
        const timeSpan = this.getSpan(data.items);
        console.log('timespan ' + timeSpan);
        this.averageMins = Math.round(
          (totalMins / timeSpan) * this.timePeriodToInt(this.timePeriod)
        );
        console.log('averageMins ' + this.averageMins);
        console.log(
          'time period to int  ' + this.timePeriodToInt(this.timePeriod)
        );
      },

      error: (error) => {
        console.log('error fetching recently played');
      },
    });
    setTimeout(() => {
      this.loading = false;
    }, 250);
  }

  msToMins(milliseconds: number): number {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = (milliseconds % 60000) / 1000;
    const totalMinutes = minutes + seconds / 60;

    return totalMinutes;
  }

  getTotalMinutes(recentPlays: any[]): number {
    if (!Array.isArray(recentPlays)) {
      console.error(
        'Expected an array for total minutes calculation, received:',
        recentPlays
      );
      return 0;
    }

    return recentPlays.reduce((total, track) => {
      const trackDuration =
        track.track && track.track.duration_ms
          ? this.msToMins(track.track.duration_ms)
          : 0;
      return total + trackDuration;
    }, 0);
  }

  getSpan(recentPlays: any[]): number {
    if (recentPlays.length > 0) {
      const firstPlayed = new Date(recentPlays[0].played_at);
      const lastPlayed = new Date(
        recentPlays[recentPlays.length - 1].played_at
      );

      const timeSpan =
        (firstPlayed.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24);
      console.log('First Played:', firstPlayed);
      console.log('Last Played:', lastPlayed);
      console.log('Time Span:', timeSpan);
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
      this.playlistLoading = true;
      const name = `Your Top Tracks Of The Last ${this.timePeriodToString(
        this.timePeriod
      )} 🎉`;
      const description = `Your Top Tracks of The Last ${this.timePeriodToString(
        this.timePeriod
      )} As Of ${this.formattedDate}. Made By Wrappedify.com 🎉`;
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
              this.playlistLoading = false;
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
