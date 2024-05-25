import { NgModule } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';

import { SpotifyInterceptor } from './interceptors/spotify-interceptor';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ResultsComponent } from './results/results.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { TabMenuModule } from 'primeng/tabmenu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoginTextComponent } from './login/login-text/login-text.component';
import { LoginImageFlicksComponent } from './login/login-image-flicks/login-image-flicks.component';
import { CommonModule, DatePipe } from '@angular/common';
import { PanelModule } from 'primeng/panel';

import { EllipsisPipe } from './pipes/ellipsis.pipe';
import { CapitalizeFirstPipe } from './pipes/capitalize-first.pipe';
import { FooterComponent } from './footer/footer.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ResultsComponent,
    LoginTextComponent,
    LoginImageFlicksComponent,
    EllipsisPipe,
    CapitalizeFirstPipe,
    FooterComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ButtonModule,
    CarouselModule,
    TabMenuModule,
    BrowserAnimationsModule,
    ProgressSpinnerModule,
    PanelModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: SpotifyInterceptor, multi: true },
    DatePipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
