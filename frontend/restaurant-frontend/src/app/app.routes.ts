import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
  },
  
  // Customer Routes
  { 
    path: 'customer/tables', 
    loadComponent: () => import('./components/customer/table-list/table-list.component').then(m => m.TableListComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'customer' }
  },
  { 
    path: 'customer/queue', 
    loadComponent: () => import('./components/customer/queue-management/queue-management.component').then(m => m.QueueManagementComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'customer' }
  },
  { 
    path: 'customer/reservations', 
    loadComponent: () => import('./components/customer/reservation/reservation.component').then(m => m.ReservationComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'customer' }
  },
  
  // Manager Routes
  { 
    path: 'manager/dashboard', 
    loadComponent: () => import('./components/manager/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'manager' }
  },
  { 
    path: 'manager/tables', 
    loadComponent: () => import('./components/manager/table-management/table-management.component').then(m => m.TableManagementComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'manager' }
  },
  
  // Admin Routes
  { 
    path: 'admin/dashboard', 
    loadComponent: () => import('./components/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' }
  },
  { 
    path: 'admin/users', 
    loadComponent: () => import('./components/admin/user-management/user-management.component').then(m => m.UserManagementComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' }
  },
  
  { path: '**', redirectTo: '/login' }
];