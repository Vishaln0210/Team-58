import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <div class="auth-header">
          <div class="logo">🍽️</div>
          <h1>Restaurant System</h1>
          <p>Welcome Back</p>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput type="email" [(ngModel)]="email" name="email" required>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput type="password" [(ngModel)]="password" name="password" required>
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit" class="full-width submit-btn" [disabled]="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/register">Register here</a></p>
        </div>

        <div class="demo-accounts">
          <p class="demo-title">Quick Test (Register these first):</p>
          <div class="demo-info">
            <p><strong>Customer:</strong> customer@test.com / password123</p>
            <p><strong>Manager:</strong> manager@test.com / password123</p>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .auth-card {
      width: 100%;
      max-width: 450px;
      padding: 2rem;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .auth-header h1 {
      margin: 0;
      font-size: 2rem;
      color: #667eea;
    }

    .auth-header p {
      color: #666;
      margin: 0.5rem 0 0 0;
    }

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .submit-btn {
      height: 50px;
      font-size: 1.1rem;
      font-weight: bold;
      margin: 1rem 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
    }

    .auth-footer a {
      color: #667eea;
      text-decoration: none;
      font-weight: bold;
    }

    .demo-accounts {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #eee;
    }

    .demo-title {
      text-align: center;
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      font-weight: bold;
    }

    .demo-info {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 10px;
      font-size: 0.85rem;
    }

    .demo-info p {
      margin: 0.5rem 0;
      color: #666;
    }

    .demo-info strong {
      color: #667eea;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Check if already logged in
    if (this.authService.isAuthenticated()) {
      const role = this.authService.getUserRole();
      this.redirectBasedOnRole(role);
    }
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.snackBar.open('Please fill in all fields', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login response:', response);
        this.loading = false;
        
        if (response.success && response.user) {
          this.snackBar.open('Login successful!', 'Close', { duration: 2000 });
          
          // Wait a moment for the token to be saved, then redirect
          setTimeout(() => {
            this.redirectBasedOnRole(response.user!.role);
          }, 500);
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.loading = false;
        this.snackBar.open(error.error?.message || 'Login failed', 'Close', { duration: 3000 });
      }
    });
  }

  private redirectBasedOnRole(role: string | null) {
    if (role === 'customer') {
      console.log('Redirecting to customer tables...');
      this.router.navigate(['/customer/tables']).then(success => {
        console.log('Navigation success:', success);
      });
    } else if (role === 'manager') {
      console.log('Redirecting to manager dashboard...');
      this.router.navigate(['/manager/dashboard']).then(success => {
        console.log('Navigation success:', success);
      });
    } else {
      console.error('Unknown role:', role);
      this.router.navigate(['/login']);
    }
  }
}