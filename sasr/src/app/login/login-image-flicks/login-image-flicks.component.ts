import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-login-image-flicks',
  templateUrl: './login-image-flicks.component.html',
  styleUrl: './login-image-flicks.component.css',
})
export class LoginImageFlicksComponent implements OnInit, OnDestroy {
  currentImage: string;
  private currentIndex = 0;
  private imageChangeInterval: any;

  images = [
    '../assets/House.JPEG',
    '../assets/EDM.JPEG',
    '../assets/Pop.JPEG',
    '../assets/Rock.JPEG',
    '../assets/IndieRock.JPEG',
    '../assets/LatinRap.JPEG',
    '../assets/Jazz.JPEG',
    '../assets/Country.JPEG',
    '../assets/PhsychRock.JPEG',
    '../assets/Rap.JPEG',
  ];

  constructor(private cdr: ChangeDetectorRef) {
    this.currentImage = this.images[0];
  }

  private startImageRotation() {
    this.imageChangeInterval = setInterval(() => {
      this.advanceImage();
    }, 1000);
  }

  private advanceImage() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.currentImage = this.images[this.currentIndex];
    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.startImageRotation();
  }

  ngOnDestroy() {
    if (this.imageChangeInterval) {
      clearInterval(this.imageChangeInterval);
    }
  }
}
