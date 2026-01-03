import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <div class="auth-header">
          <div class="logo">🍽️</div>
          <h1>Create Account</h1>
          <p>Join our restaurant system</p>
        </div>

        <form (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Full Name</mat-label>
            <input matInput [(ngModel)]="name" name="name" required>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput type="email" [(ngModel)]="email" name="email" required>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput type="password" [(ngModel)]="password" name="password" required>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Contact Info</mat-label>
            <input matInput [(ngModel)]="contact_info" name="contact_info">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
  <mat-label>Register As</mat-label>
  <mat-select [(ngModel)]="role" name="role" required>
    <mat-option value="customer">Customer</mat-option>
    <mat-option value="manager">Manager</mat-option>
    <mat-option value="admin">Admin</mat-option>
  </mat-select>
</mat-form-field>

          <button mat-raised-button color="primary" type="submit" class="full-width submit-btn">
            Register
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/login">Login here</a></p>
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

    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
    }

    .auth-footer a {
      color: #667eea;
      text-decoration: none;
      font-weight: bold;
    }
  `]
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  contact_info = '';
  role = 'customer';

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onSubmit() {
    if (!this.name || !this.email || !this.password || !this.role) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    const userData = {
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role,
      contact_info: this.contact_info
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Registration successful! Please login.', 'Close', { duration: 3000 });
          this.router.navigate(['/login']);
        }
      },
      error: (error) => {
        this.snackBar.open(error.error.message || 'Registration failed', 'Close', { duration: 3000 });
      }
    });
  }
}