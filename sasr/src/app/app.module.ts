import { NgModule } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';

import { SpotifyInterceptor } from './spotify-interceptor';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ResultsComponent } from './results/results.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { ButtonModule } from 'primeng/button';
import { LoginTextComponent } from './login/login-text/login-text.component';
import { LoginImageFlicksComponent } from './login/login-image-flicks/login-image-flicks.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ResultsComponent,
    LoginTextComponent,
    LoginImageFlicksComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, ButtonModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: SpotifyInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
