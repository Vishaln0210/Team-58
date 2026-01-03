import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <mat-toolbar class="navbar">
      <div class="navbar-container">
        <div class="navbar-left">
          <span class="logo">🍽️ Restaurant System</span>
          
          <div class="nav-links" *ngIf="currentUser">
            <ng-container *ngIf="currentUser.role === 'customer'">
              <a mat-button routerLink="/customer/tables" routerLinkActive="active">Tables</a>
              <a mat-button routerLink="/customer/queue" routerLinkActive="active">Queue</a>
              <a mat-button routerLink="/customer/reservations" routerLinkActive="active">Reservations</a>
            </ng-container>
            
            <ng-container *ngIf="currentUser.role === 'manager'">
              <a mat-button routerLink="/manager/dashboard" routerLinkActive="active">Dashboard</a>
              <a mat-button routerLink="/manager/tables" routerLinkActive="active">Manage Tables</a>
            </ng-container>

            <ng-container *ngIf="currentUser.role === 'admin'">
              <a mat-button routerLink="/admin/dashboard" routerLinkActive="active">Analytics</a>
              <a mat-button routerLink="/admin/users" routerLinkActive="active">Users</a>
            </ng-container>
          </div>
        </div>
        
        <div class="navbar-right" *ngIf="currentUser">
          <button mat-icon-button [matMenuTriggerFor]="menu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #menu="matMenu">
            <div class="user-info">
              <p class="user-name">{{ currentUser.name }}</p>
              <p class="user-role">{{ currentUser.role }}</p>
            </div>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }

    .navbar-container {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: bold;
    }

    .nav-links {
      display: flex;
      gap: 0.5rem;
    }

    .nav-links a {
      color: white;
      transition: all 0.3s;
    }

    .nav-links a:hover {
      background: rgba(255,255,255,0.2);
    }

    .nav-links a.active {
      background: rgba(255,255,255,0.3);
    }

    .user-info {
      padding: 1rem;
      border-bottom: 1px solid #eee;
    }

    .user-name {
      font-weight: bold;
      margin: 0;
    }

    .user-role {
      color: #666;
      font-size: 0.9rem;
      margin: 0.25rem 0 0 0;
      text-transform: capitalize;
    }
  `]
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout() {
    this.authService.logout();
  }
}