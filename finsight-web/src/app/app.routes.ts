import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { authGuard } from './auth/auth.guard';
import { ChatComponent } from './chat/chat.component';
import { LandingComponent } from './landing/landing.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'auth',
    component: AuthComponent
  },
  {
    path: 'chat',
    component: ChatComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
