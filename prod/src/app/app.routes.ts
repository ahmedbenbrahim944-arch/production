// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ProdComponent } from './prod/prod.component';
import { PlanificationComponent } from './planification/planification.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'planification', component: PlanificationComponent },
  { path: 'prod', component: ProdComponent },
  { path: 'login', component: LoginComponent },
  
  
];