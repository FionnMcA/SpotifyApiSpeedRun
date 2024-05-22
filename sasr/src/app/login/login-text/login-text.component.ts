import { Component } from '@angular/core';

@Component({
  selector: 'app-login-text',
  templateUrl: './login-text.component.html',
  styleUrl: './login-text.component.css',
})
export class LoginTextComponent {
  onLogin() {
    window.location.href =
      'https://spotify-api-speed-run-9b86.vercel.app/api/login';
  }
  title = `Welcome to<br>Wrappedify 🎉`;
}
