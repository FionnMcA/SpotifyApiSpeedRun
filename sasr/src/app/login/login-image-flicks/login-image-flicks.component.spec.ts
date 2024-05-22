import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginImageFlicksComponent } from './login-image-flicks.component';

describe('LoginImageFlicksComponent', () => {
  let component: LoginImageFlicksComponent;
  let fixture: ComponentFixture<LoginImageFlicksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginImageFlicksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoginImageFlicksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
