import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ResultsComponent } from './results/results.component';
import { AuthGuardService } from './auth-guard.service';

const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'results',
    component: ResultsComponent,
    canActivate: [AuthGuardService],
  },
  { path: '**', component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
