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
  items: MenuItem[] | undefined;
  activeItem: MenuItem | undefined;
  colours: string[] = ['green', 'red', 'blue', 'orange'];
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
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching top tracks:', error);
      },
    });
  }

  onCreatePlaylist() {
    const description = this.timePeriod;
    const name = `Your top tracks of ${this.timePeriod}`;
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
