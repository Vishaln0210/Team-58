import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { AdminService } from '../../../services/admin.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    
    <div class="page-container">
      <div class="page-header">
        <h1>👥 User Management</h1>
        <p>Manage all system users</p>
      </div>

      <div class="loading" *ngIf="loading">
        <mat-spinner></mat-spinner>
      </div>

      <div class="content" *ngIf="!loading">
        <!-- User Statistics -->
        <div class="stats-bar">
          <mat-card class="stat-card">
            <mat-icon class="stat-icon">people</mat-icon>
            <div>
              <h3>Total Users</h3>
              <p class="stat-number">{{ users.length }}</p>
            </div>
          </mat-card>

          <mat-card class="stat-card customer">
            <mat-icon class="stat-icon">person</mat-icon>
            <div>
              <h3>Customers</h3>
              <p class="stat-number">{{ getCountByRole('customer') }}</p>
            </div>
          </mat-card>

          <mat-card class="stat-card manager">
            <mat-icon class="stat-icon">manage_accounts</mat-icon>
            <div>
              <h3>Managers</h3>
              <p class="stat-number">{{ getCountByRole('manager') }}</p>
            </div>
          </mat-card>

          <mat-card class="stat-card admin">
            <mat-icon class="stat-icon">admin_panel_settings</mat-icon>
            <div>
              <h3>Admins</h3>
              <p class="stat-number">{{ getCountByRole('admin') }}</p>
            </div>
          </mat-card>
        </div>

        <!-- Users List -->
        <mat-card class="users-card">
          <h2>All Users</h2>
          
          <div class="users-grid">
            <mat-card *ngFor="let user of users" class="user-card">
              <div class="user-header">
                <mat-icon class="user-icon">account_circle</mat-icon>
                <div class="user-info">
                  <h3>{{ user.name }}</h3>
                  <p class="user-email">{{ user.email }}</p>
                  <mat-chip [class]="user.role">{{ user.role | titlecase }}</mat-chip>
                </div>
              </div>

              <div class="user-details" *ngIf="user.contact_info">
                <mat-icon>phone</mat-icon>
                <span>{{ user.contact_info }}</span>
              </div>

              <div class="user-details">
                <mat-icon>calendar_today</mat-icon>
                <span>Joined {{ user.created_at | date:'mediumDate' }}</span>
              </div>

              <div class="user-actions">
                <button mat-raised-button color="warn" (click)="deleteUser(user)" [disabled]="user.role === 'admin'">
                  <mat-icon>delete</mat-icon>
                  Delete
                </button>
              </div>
            </mat-card>
          </div>

          <div class="empty-state" *ngIf="users.length === 0">
            <mat-icon>people_outline</mat-icon>
            <p>No users found</p>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      min-height: calc(100vh - 64px);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .page-header {
      text-align: center;
      color: white;
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 3rem;
      margin: 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    .page-header p {
      font-size: 1.2rem;
      opacity: 0.9;
      margin-top: 0.5rem;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 4rem;
    }

    .content {
      max-width: 1400px;
      margin: 0 auto;
    }

    .stats-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      padding: 1.5rem;
      border-radius: 15px;
      display: flex;
      align-items: center;
      gap: 1rem;
      background: white;
    }

    .stat-card.customer {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }

    .stat-card.manager {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      color: white;
    }

    .stat-card.admin {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      color: white;
    }

    .stat-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
    }

    .stat-card h3 {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      margin: 0.25rem 0 0 0;
    }

    .users-card {
      padding: 2rem;
      border-radius: 15px;
    }

    .users-card h2 {
      margin: 0 0 2rem 0;
      color: #667eea;
    }

    .users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
gap: 1.5rem;
}
.user-card {
  padding: 1.5rem;
  border-radius: 15px;
  transition: transform 0.3s;
}

.user-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.user-header {
  display: flex;
  align-items: start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.user-icon {
  font-size: 3rem;
  width: 3rem;
  height: 3rem;
  color: #667eea;
}

.user-info {
  flex: 1;
}

.user-info h3 {
  margin: 0;
  font-size: 1.3rem;
  color: #333;
}

.user-email {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
}

.user-info mat-chip {
  margin-top: 0.5rem;
}

.user-info mat-chip.customer {
  background: #4facfe;
  color: white;
}

.user-info mat-chip.manager {
  background: #43e97b;
  color: white;
}

.user-info mat-chip.admin {
  background: #fa709a;
  color: white;
}

.user-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.75rem 0;
  color: #666;
}

.user-details mat-icon {
  font-size: 1.2rem;
  width: 1.2rem;
  height: 1.2rem;
  color: #667eea;
}

.user-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.user-actions button {
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: #666;
}

.empty-state mat-icon {
  font-size: 4rem;
  width: 4rem;
  height: 4rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}`]
})
export class UserManagementComponent implements OnInit {
users: User[] = [];
loading = true;
constructor(
private adminService: AdminService,
private snackBar: MatSnackBar
) {}
ngOnInit() {
this.loadUsers();
}
loadUsers() {
this.loading = true;
this.adminService.getAllUsers().subscribe({
next: (response) => {
if (response.success) {
this.users = response.data;
}
this.loading = false;
},
error: (error) => {
this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
this.loading = false;
}
});
}
getCountByRole(role: string): number {
return this.users.filter(u => u.role === role).length;
}
deleteUser(user: User) {
if (user.role === 'admin') {
this.snackBar.open('Cannot delete admin users', 'Close', { duration: 3000 });
return;
}
if (!confirm(`Delete user ${user.name}? This action cannot be undone.`)) {
  return;
}

this.adminService.deleteUser(user.id).subscribe({
  next: (response) => {
    if (response.success) {
      this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
      this.loadUsers();
    }
  },
  error: (error) => {
    this.snackBar.open(error.error?.message || 'Failed to delete user', 'Close', { duration: 3000 });
  }
});
}
}