import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  ngOnInit() {
    sessionStorage.clear();
  }
  login() {
    window.location.href =
      'https://spotify-api-speed-run-9b86.vercel.app/api/login';
  }
}
