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

  ngOnInit(): void {
    this.route.fragment.subscribe((fragment) => {
      if (fragment) {
        const tokens = this.parseFragment(fragment);
        if (tokens.access_token && tokens.refresh_token) {
          localStorage.setItem('accessToken', tokens.access_token);
          localStorage.setItem('refreshToken', tokens.refresh_token);
        }
      }
    });
    this.getTopTracks();
  }

  private parseFragment(fragment: string): any {
    return fragment.split('&').reduce((acc, part) => {
      const item = part.split('=');
      acc[item[0]] = decodeURIComponent(item[1]);
      return acc;
    }, {});
  }
  getTopTracks(): void {
    const accessToken = localStorage.getItem('accessToken');

    const timePeriod = 'long_term';
    const url = `https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${timePeriod}`;

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
