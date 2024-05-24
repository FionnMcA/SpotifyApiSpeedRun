import { Component } from '@angular/core';

@Component({
  selector: 'app-login-text',
  templateUrl: './login-text.component.html',
  styleUrl: './login-text.component.css',
})
export class LoginTextComponent {
  title = `Welcome to<br>Wrappedify 🎉`;

  //When the user clicks Login with Spotify they're redirected
  //to my backend which will redirect them to spotify Auth page
  onLogin() {
    window.location.href =
      'https://spotify-api-speed-run-9b86.vercel.app/api/login';
  }
}
