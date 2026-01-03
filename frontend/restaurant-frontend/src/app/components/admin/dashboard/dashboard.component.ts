import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { AdminService } from '../../../services/admin.service';
import { AnalyticsData } from '../../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSnackBarModule,
    NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    
    <div class="page-container">
      <div class="page-header">
        <h1>📊 System Analytics</h1>
        <p>Complete overview of restaurant operations</p>
      </div>

      <div class="loading" *ngIf="loading">
        <mat-spinner></mat-spinner>
      </div>

      <div class="content" *ngIf="!loading && analytics">
        <!-- User Statistics -->
        <div class="section">
          <h2>👥 User Statistics</h2>
          <div class="stats-grid">
            <mat-card *ngFor="let stat of analytics.users" class="stat-card">
              <mat-icon class="stat-icon">
                {{ stat.role === 'customer' ? 'people' : stat.role === 'manager' ? 'manage_accounts' : 'admin_panel_settings' }}
              </mat-icon>
              <div class="stat-info">
                <h3>{{ stat.role | titlecase }}s</h3>
                <p class="stat-number">{{ stat.count }}</p>
              </div>
            </mat-card>
          </div>
        </div>

        <!-- Table Statistics -->
        <div class="section">
          <h2>🍽️ Table Statistics</h2>
          <div class="stats-grid">
            <mat-card class="stat-card total">
              <mat-icon class="stat-icon">restaurant</mat-icon>
              <div class="stat-info">
                <h3>Total Tables</h3>
                <p class="stat-number">{{ analytics.tables.total_tables }}</p>
              </div>
            </mat-card>

            <mat-card class="stat-card available">
              <mat-icon class="stat-icon">check_circle</mat-icon>
              <div class="stat-info">
                <h3>Available</h3>
                <p class="stat-number">{{ analytics.tables.available }}</p>
              </div>
            </mat-card>

            <mat-card class="stat-card occupied">
              <mat-icon class="stat-icon">people</mat-icon>
              <div class="stat-info">
                <h3>Occupied</h3>
                <p class="stat-number">{{ analytics.tables.occupied }}</p>
              </div>
            </mat-card>

            <mat-card class="stat-card reserved">
              <mat-icon class="stat-icon">event</mat-icon>
              <div class="stat-info">
                <h3>Reserved</h3>
                <p class="stat-number">{{ analytics.tables.reserved }}</p>
              </div>
            </mat-card>
          </div>
        </div>

        <!-- Table Types -->
        <div class="section">
          <h2>⭐ Table Types</h2>
          <div class="stats-grid-2">
            <mat-card class="stat-card vip">
              <mat-icon class="stat-icon">star</mat-icon>
              <div class="stat-info">
                <h3>VIP Tables</h3>
                <p class="stat-number">{{ analytics.tables.vip_tables }}</p>
              </div>
            </mat-card>

            <mat-card class="stat-card regular">
              <mat-icon class="stat-icon">table_restaurant</mat-icon>
              <div class="stat-info">
                <h3>Regular Tables</h3>
                <p class="stat-number">{{ analytics.tables.regular_tables }}</p>
              </div>
            </mat-card>
          </div>
        </div>

        <!-- Queue & Reservations -->
        <div class="section">
          <h2>📋 Queue & Reservations</h2>
          <div class="stats-grid-2">
            <mat-card class="stat-card queue">
              <mat-icon class="stat-icon">queue</mat-icon>
              <div class="stat-info">
                <h3>In Queue</h3>
                <p class="stat-number">{{ analytics.queue.queue_count }}</p>
              </div>
            </mat-card>

            <mat-card class="stat-card reservations">
              <mat-icon class="stat-icon">book_online</mat-icon>
              <div class="stat-info">
                <h3>Active Reservations</h3>
                <p class="stat-number">{{ analytics.reservations.reservation_count }}</p>
              </div>
            </mat-card>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="section">
          <h2>🕐 Recent Activity</h2>
          <mat-card class="activity-card">
            <div class="activity-list" *ngIf="analytics.recentActivity.length > 0">
              <div *ngFor="let activity of analytics.recentActivity" class="activity-item">
                <mat-icon [class]="activity.status">
                  {{ getStatusIcon(activity.status) }}
                </mat-icon>
                <div class="activity-info">
                  <p class="activity-table">Table {{ activity.table_number }}</p>
                  <p class="activity-details">
                    {{ activity.status | titlecase }}
                    <span *ngIf="activity.current_customer_name"> - {{ activity.current_customer_name }}</span>
                  </p>
                  <p class="activity-time">{{ activity.updated_at | date:'short' }}</p>
                </div>
              </div>
            </div>
            <div class="empty-state" *ngIf="analytics.recentActivity.length === 0">
              <p>No recent activity</p>
            </div>
          </mat-card>
        </div>

        <!-- Utilization Summary -->
        <div class="section">
          <h2>📈 Utilization Summary</h2>
          <mat-card class="summary-card">
            <div class="summary-grid">
              <div class="summary-item">
                <h4>Occupancy Rate</h4>
                <p class="summary-value">{{ getOccupancyRate() }}%</p>
              </div>
              <div class="summary-item">
                <h4>VIP Ratio</h4>
                <p class="summary-value">{{ getVIPRatio() }}%</p>
              </div>
              <div class="summary-item">
                <h4>Queue Wait</h4>
                <p class="summary-value">{{ analytics.queue.queue_count * 15 }} min</p>
              </div>
            </div>
          </mat-card>
        </div>
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

    .section {
      margin-bottom: 2rem;
    }

    .section h2 {
      color: white;
      margin-bottom: 1rem;
      font-size: 1.8rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .stats-grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      padding: 1.5rem;
      border-radius: 15px;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      transition: transform 0.3s;
    }

    .stat-card:hover {
      transform: translateY(-5px);
    }

    .stat-card.total {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .stat-card.available {
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      color: white;
    }

    .stat-card.occupied {
      background: linear-gradient(135deg, #f44336 0%, #e91e63 100%);
      color: white;
    }

    .stat-card.reserved {
      background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
      color: white;
    }

    .stat-card.vip {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .stat-card.regular {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }

    .stat-card.queue {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      color: white;
    }

    .stat-card.reservations {
      background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
      color: white;
    }

    .stat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
    }

    .stat-info h3 {
      margin: 0;
      font-size: 1rem;
      opacity: 0.9;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      margin: 0.5rem 0 0 0;
    }

    .activity-card, .summary-card {
      padding: 2rem;
      border-radius: 15px;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 10px;
    }

    .activity-item mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .activity-item mat-icon.available {
      color: #4caf50;
    }

    .activity-item mat-icon.occupied {
      color: #f44336;
    }

    .activity-item mat-icon.reserved {
      color: #ff9800;
    }

    .activity-info {
      flex: 1;
    }

    .activity-table {
      font-weight: bold;
      margin: 0;
      color: #667eea;
    }

    .activity-details {
      margin: 0.25rem 0;
      color: #666;
    }

    .activity-time {
      margin: 0.25rem 0 0 0;
      font-size: 0.85rem;
      color: #999;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #666;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      text-align: center;
    }

    .summary-item h4 {
      margin: 0;
      color: #667eea;
    }

    .summary-value {
      font-size: 2.5rem;
      font-weight: bold;
      margin: 0.5rem 0 0 0;
      color: #333;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  analytics: AnalyticsData | null = null;
  loading = true;
  private refreshInterval: any;

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadAnalytics();
    // Auto-refresh every 10 seconds
    this.refreshInterval = setInterval(() => this.loadAnalytics(), 10000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadAnalytics() {
    this.adminService.getAnalytics().subscribe({
      next: (response) => {
        if (response.success) {
          this.analytics = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load analytics', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'available': return 'check_circle';
      case 'occupied': return 'people';
      case 'reserved': return 'event';
      default: return 'info';
    }
  }

  getOccupancyRate(): number {
    if (!this.analytics) return 0;
    const total = this.analytics.tables.total_tables;
    if (total === 0) return 0;
    return Math.round((this.analytics.tables.occupied / total) * 100);
  }

  getVIPRatio(): number {
    if (!this.analytics) return 0;
    const total = this.analytics.tables.total_tables;
    if (total === 0) return 0;
    return Math.round((this.analytics.tables.vip_tables / total) * 100);
  }
}