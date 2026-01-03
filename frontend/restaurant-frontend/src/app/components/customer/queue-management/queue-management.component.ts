import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { QueueService } from '../../../services/queue.service';
import { QueueItem } from '../../../models/user.model';

@Component({
  selector: 'app-queue-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    
    <div class="page-container">
      <div class="page-header">
        <h1>Queue Status</h1>
        <p>Track your waiting position</p>
      </div>

      <div class="loading" *ngIf="loading">
        <mat-spinner></mat-spinner>
      </div>

      <div class="content" *ngIf="!loading">
        <!-- My Position Card -->
        <mat-card class="my-position-card" *ngIf="myPosition">
          <h2>Your Position</h2>
          <div class="position-display">
            <div class="position-number">#{{ myPosition.queue_position }}</div>
            <div class="position-info">
              <p><strong>Table {{ myPosition.table_number }}</strong></p>
              <p>{{ myPosition.capacity }} people • {{ myPosition.type }}</p>
              <p class="estimate">Estimated wait: {{ getEstimatedWait() }} minutes</p>
            </div>
          </div>
          <button mat-raised-button color="warn" (click)="leaveQueue()" class="leave-btn">
            Leave Queue
          </button>
        </mat-card>

        <mat-card class="no-position-card" *ngIf="!myPosition">
          <h3>You're not in the queue</h3>
          <p>Visit the Tables page to join a queue</p>
        </mat-card>

        <!-- Current Queue -->
        <mat-card class="queue-card">
          <h2>Current Queue</h2>
          
          <div class="queue-empty" *ngIf="queue.length === 0">
            <p>No one in queue</p>
          </div>

          <div class="queue-list" *ngIf="queue.length > 0">
            <div *ngFor="let item of queue" class="queue-item">
              <div class="position-badge">{{ item.queue_position }}</div>
              <div class="queue-item-info">
                <h4>{{ item.current_customer_name }}</h4>
                <p>Table {{ item.table_number }} • {{ item.capacity }} seats</p>
              </div>
            </div>
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
    }

    .page-header p {
      font-size: 1.2rem;
      opacity: 0.9;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 4rem;
    }

    .content {
      max-width: 1000px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .my-position-card {
      padding: 2rem;
      border-radius: 15px;
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      color: white;
    }

    .my-position-card h2 {
      margin: 0 0 1.5rem 0;
      font-size: 1.5rem;
    }

    .position-display {
      display: flex;
      align-items: center;
      gap: 2rem;
      margin-bottom: 1.5rem;
    }

    .position-number {
      font-size: 4rem;
      font-weight: bold;
      background: rgba(255,255,255,0.2);
      padding: 1rem 2rem;
      border-radius: 15px;
    }

    .position-info p {
      margin: 0.5rem 0;
      font-size: 1.1rem;
    }

    .estimate {
      opacity: 0.9;
      font-style: italic;
    }

    .leave-btn {
      width: 100%;
      height: 45px;
      font-size: 1rem;
      font-weight: bold;
    }

    .no-position-card {
      padding: 3rem;
      text-align: center;
      border-radius: 15px;
    }

    .no-position-card h3 {
      color: #667eea;
      margin: 0 0 1rem 0;
    }

    .queue-card {
      padding: 2rem;
      border-radius: 15px;
    }

    .queue-card h2 {
      margin: 0 0 1.5rem 0;
      color: #667eea;
    }

    .queue-empty {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .queue-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .queue-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 10px;
      transition: transform 0.2s;
    }

    .queue-item:hover {
      transform: translateX(5px);
    }

    .position-badge {
      background: #667eea;
      color: white;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
    }

    .queue-item-info h4 {
      margin: 0;
      color: #333;
    }

    .queue-item-info p {
      margin: 0.5rem 0 0 0;
      color: #666;
    }
  `]
})
export class QueueManagementComponent implements OnInit, OnDestroy {
  queue: QueueItem[] = [];
  myPosition: any = null;
  loading = true;
  private refreshInterval: any;

  constructor(
    private queueService: QueueService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadData();
    // Refresh every 5 seconds
    this.refreshInterval = setInterval(() => this.loadData(), 5000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadData() {
    this.queueService.getQueue().subscribe({
      next: (response) => {
        if (response.success) {
          this.queue = response.data;
        }
      }
    });

    this.queueService.getMyPosition().subscribe({
      next: (response) => {
        if (response.success) {
          this.myPosition = response.data;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getEstimatedWait(): number {
    if (!this.myPosition) return 0;
    return this.myPosition.queue_position * 15;
  }

  leaveQueue() {
    if (!confirm('Are you sure you want to leave the queue?')) return;

    this.queueService.leaveQueue().subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Left queue successfully', 'Close', { duration: 3000 });
          this.myPosition = null;
          this.loadData();
        }
      },
      error: (error) => {
        this.snackBar.open('Failed to leave queue', 'Close', { duration: 3000 });
      }
    });
  }
}