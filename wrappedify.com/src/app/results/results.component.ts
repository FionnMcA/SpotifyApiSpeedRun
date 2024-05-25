import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
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
  // Wrappedup card and creating playlist variables
  trackUris: any[] = [];
  tracks: any[] = [];
  artists: any[] = [];
  topArtistImg: string;
  playlistUrl: string;
  timePeriod = 'long_term';
  topGenre: string;
  averageMins: number = 0;
  formattedDate: string;

  // Carousel and tab menu items
  items: MenuItem[] | undefined;
  activeItem: MenuItem | undefined;
  colours: string[] = ['green', 'red', 'blue', 'orange'];

  // Loading and is clicked booleans
  isClicked = false;
  loading: boolean = true;
  playlistString = 'Create Playlist';
  playlistLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private authService: AuthServiceService,
    private datePipe: DatePipe
  ) {
    // Get todays date
    this.formattedDate = this.datePipe.transform(new Date(), 'dd-MM-yyyy');

    // Set the items for the Pmenu
    // 3 items '4 Weeks', '6 Months' and 'Year'
    // and when clicked the Time Period will change appropriately
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
    // Set the defualt time period to Year
    this.activeItem = this.items[2];
  }

  // OnInit handle the hash ie get the user's access token and store it
  // also fetch all the users data items to display them OnInit
  ngOnInit(): void {
    this.authService.handleHash();
    this.getTopTracks();
    this.getTopArtists();
    this.getRecentlyPlayed();
  }

  // Convert the time period to a more readable string
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

  // Convert the time period to a number for calulcating the minutes listened
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

  // When the user changes the time period, set the timePeriod variable
  // and call the getTopTracks, getTopArtists, and getRecentlyPlayed methods
  // to match the selected time period's data
  onChangeTimePeriod(timePeriod: string): void {
    this.timePeriod = timePeriod;
    this.getTopTracks();
    this.getTopArtists();
    this.getRecentlyPlayed();
  }

  // TODO: Should probably move this api calls into a service

  // Get the user's top artists via a GET request to Spotify's Web API
  // Retrieve the profile pictures of the user's top artists
  // Spotify doesn't provide the user's top genre, so it must be inferred from the user's top artists' genres

  getTopArtists(): void {
    // URL to Spotify's API to request a user's top artists, with timePeriod as a variable
    // so it changes dynamically when a user changes the time period
    const url = `https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${this.timePeriod}`;

    this.http.get(url, {}).subscribe({
      next: (data: any) => {
        // Subscribe to the GET request, and if successful:
        // - Define an empty dictionary
        // - For each artist, call the addToGenreDict method
        //   and pass in the artist's genres and the dictionary as parameters,
        //   then assign the result to genreDict
        let genreDict = {};
        data.items.forEach((artist) => {
          genreDict = this.addToGenreDict(artist.genres, genreDict);
        });
        // Sort the genres in descending order
        const sortedGenres = Object.entries(genreDict).sort(
          (a: [string, number], b: [string, number]) => {
            return b[1] - a[1];
          }
        );
        // Save the top genre, the top artist's image cover, and the top 5 artists
        this.topGenre = sortedGenres[0][0];
        this.topArtistImg = data.items[0].images[0].url;
        this.artists = data.items.slice(0, 5);
      },
      error: (error) => {
        console.log('error fetching top artists ', error);
      },
    });
  }

  addToGenreDict(genres, genreDict) {
    // For each of the artist's genres:
    // - If the genre doesn't exist, add it to the dictionary
    // - If it exists, increment its count by 1
    // Return the updated genreDict
    genres.forEach((genre) => {
      genreDict[genre] = (genreDict[genre] || 0) + 1;
    });
    return genreDict;
  }

  // Get the user's top tracks via a GET request to Spotify's Web API
  getTopTracks(): void {
    const url = `https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${this.timePeriod}`;
    this.http.get(url, {}).subscribe({
      next: (data: any) => {
        // Save the 50 track uris incase the user wants to create a playlist
        this.trackUris = data.items.map((item: any) => item.uri);
        // Save the top 5 tracks to display them
        this.tracks = data.items.slice(0, 5);
      },
      error: (error) => {
        console.error('Error fetching top tracks:', error);
      },
    });
  }

  // Methods to calculate an estimate of the users minutes listened

  // Spotify does not provide access to the total minutes a user spends listening.
  // However, it does offer data on a user's 50 most recently played tracks and the
  // times at which they were played. From this, we can calculate the duration between
  // the user's 1st and 50th track and calculate the total minutes spent listening.
  // Thus, we can approximate how many minutes a user spends listening over periods
  // of 4 weeks, 6 months, and 1 year.

  getRecentlyPlayed(): void {
    const url = `https://api.spotify.com/v1/me/player/recently-played?limit=50`;

    this.http.get(url, {}).subscribe({
      next: (data: any) => {
        // Get the total duration of the 50 tracks
        const totalMins = this.getTotalMinutes(data.items);
        // Get the time span from the 1st track to the 50th track
        const timeSpan = this.getSpan(data.items);
        // Calculate the average minutes
        this.averageMins = Math.round(
          (totalMins / timeSpan) * this.timePeriodToInt(this.timePeriod)
        );
      },
      error: (error) => {
        console.log('error fetching recently played');
      },
    });
    setTimeout(() => {
      this.loading = false;
    }, 333);
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
    // Use reduce to calculate the total duration in minutes
    return recentPlays.reduce((total, track) => {
      const trackDuration =
        // Check if track and track.duration_ms exist, and convert to minutes
        track.track && track.track.duration_ms
          ? this.msToMins(track.track.duration_ms)
          : 0;
      return total + trackDuration; // Accumulate the total duration
    }, 0);
  }

  // Get the time span between the 1st and 50th track
  getSpan(recentPlays: any[]): number {
    if (recentPlays.length > 0) {
      // Get the date and time of the first played track
      const firstPlayed = new Date(recentPlays[0].played_at);
      // Get the date and time of the last played track
      const lastPlayed = new Date(
        recentPlays[recentPlays.length - 1].played_at
      );
      // Calculate the time span in days between the first and last played tracks
      const timeSpan =
        (firstPlayed.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24);

      return timeSpan;
    }
    return 0;
  }

  // Create a playlist for the user of their top tracks
  onCreatePlaylist() {
    // If the user clicks create playlist and the label of the button is Create Playlist
    if (this.playlistString === 'Create Playlist') {
      // Set playlist Loading to true so a spinner appears
      this.playlistLoading = true;

      // Set the name and description of the playlist
      const name = `Your Top Tracks Of The Last ${this.timePeriodToString(
        this.timePeriod
      )} 🎉`;
      const description = `Your Top Tracks of The Last ${this.timePeriodToString(
        this.timePeriod
      )} As Of ${this.formattedDate}. Made By Wrappedify.com 🎉`;

      // Get the Users Profile to get their ID
      this.getProfile().subscribe({
        next: (userProfile) => {
          const userId = userProfile.id;

          // Create an empty Playlist for the user and then add tracks to it
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
      // If the user clicks "View Playlist", redirect them to the playlist
      this.isClicked = false;
      this.playlistString = 'Create Playlist';
      window.location.href = this.playlistUrl;
    }
  }

  // Make getProfile an Observable so it can be subscribed to in onCreatePlaylist()
  getProfile(): Observable<any> {
    // Get the user's profile via a GET request to Spotify's Web API
    const url = 'https://api.spotify.com/v1/me';
    return this.http.get(url, {});
  }

  // Make createEmptyPlaylist an Observable so it can be subscribed to in onCreatePlaylist()
  createEmptyPlaylist(userId, name, description): Observable<any> {
    // Make the user an empty playlist via a POST request to Spotify's Web API
    const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
    return this.http.post(url, {
      name: name,
      description: description,
      public: true,
    });
  }

  addTracksToPlaylist(playlistId, trackUris) {
    // Add the users top tracks to the empty playlist via a POST request to Spotify's Web API
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    this.http.post(url, { uris: trackUris }, {}).subscribe({
      next: (response) => console.log('Tracks added successfully'),
      error: (error) => console.error('error adding tracks ' + error),
    });
  }
}
