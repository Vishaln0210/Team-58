import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { TableService } from '../../../services/table.service';
import { QueueService } from '../../../services/queue.service';
import { Table, QueueItem } from '../../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    
    <div class="page-container">
      <div class="page-header">
        <h1>Manager Dashboard</h1>
        <p>Real-time restaurant overview</p>
      </div>

      <div class="loading" *ngIf="loading">
        <mat-spinner></mat-spinner>
      </div>

      <div class="content" *ngIf="!loading">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <mat-card class="stat-card available">
            <div class="stat-icon">✓</div>
            <div class="stat-info">
              <h3>Available</h3>
              <p class="stat-number">{{ getAvailableCount() }}</p>
            </div>
          </mat-card>

          <mat-card class="stat-card occupied">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <h3>Occupied</h3>
              <p class="stat-number">{{ getOccupiedCount() }}</p>
            </div>
          </mat-card>

          <mat-card class="stat-card queue">
            <div class="stat-icon">⏱️</div>
            <div class="stat-info">
              <h3>In Queue</h3>
              <p class="stat-number">{{ queue.length }}</p>
            </div>
          </mat-card>
        </div>

        <!-- Main Content -->
        <div class="main-grid">
          <!-- All Tables -->
          <mat-card class="section-card">
            <h2>All Tables</h2>
            <div class="table-list">
              <div *ngFor="let table of tables" class="table-item">
                <div class="table-item-header">
                  <div>
                    <h4>Table {{ table.table_number }}</h4>
                    <p>{{ table.capacity }} seats</p>
                  </div>
                  <mat-chip class="status-chip" [class]="table.status">
                    {{ table.status }}
                  </mat-chip>
                </div>
                
                <p class="customer-name" *ngIf="table.current_customer_name">
                  Customer: {{ table.current_customer_name }}
                </p>

                <div class="table-actions">
                  <button mat-raised-button 
                          *ngIf="table.status === 'occupied'" 
                          color="primary"
                          (click)="vacateTable(table.id)">
                    Vacate
                  </button>
                  <button mat-raised-button 
                          *ngIf="table.status === 'available' && queue.length > 0" 
                          color="accent"
                          (click)="seatNext(table.id)">
                    Seat Next
                  </button>
                </div>
              </div>
            </div>
          </mat-card>

          <!-- Queue -->
          <mat-card class="section-card">
            <h2>Waiting Queue</h2>
            
            <div class="empty-state" *ngIf="queue.length === 0">
              <p>No one in queue</p>
            </div>

            <div class="queue-list" *ngIf="queue.length > 0">
              <div *ngFor="let item of queue" class="queue-item">
                <div class="queue-badge">{{ item.queue_position }}</div>
                <div class="queue-info">
                  <h4>{{ item.current_customer_name }}</h4>
                  <p>Table {{ item.table_number }} • {{ item.capacity }} seats</p>
                </div>
                <button mat-raised-button color="primary" (click)="seatCustomer(item)">
                  Seat Now
                </button>
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
      max-width: 1400px;
      margin: 0 auto;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      padding: 1.5rem;
      border-radius: 15px;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      color: white;
    }

    .stat-card.available {
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
    }

    .stat-card.occupied {
      background: linear-gradient(135deg, #f44336 0%, #e91e63 100%);
    }

    .stat-card.queue {
      background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
    }

    .stat-icon {
      font-size: 3rem;
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

    .main-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 2rem;
    }

    @media (max-width: 768px) {
      .main-grid {
        grid-template-columns: 1fr;
      }
    }

    .section-card {
      padding: 2rem;
      border-radius: 15px;
    }

    .section-card h2 {
      margin: 0 0 1.5rem 0;
      color: #667eea;
    }

    .table-list, .queue-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .table-item {
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 10px;
    }

    .table-item-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 0.5rem;
    }

    .table-item h4 {
      margin: 0;
      color: #333;
    }

    .table-item p {
      margin: 0.25rem 0;
      color: #666;
    }

    .customer-name {
      color: #667eea;
      font-weight: 500;
    }

    .status-chip {
      font-weight: bold;
      font-size: 0.75rem;
    }

    .status-chip.available {
      background: #4caf50;
      color: white;
    }

    .status-chip.occupied {
      background: #f44336;
      color: white;
    }

    .status-chip.reserved {
      background: #ff9800;
      color: white;
    }

    .table-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .table-actions button {
      flex: 1;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .queue-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 10px;
    }

    .queue-badge {
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
      flex-shrink: 0;
    }

    .queue-info {
      flex: 1;
    }

    .queue-info h4 {
      margin: 0;
      color: #333;
    }

    .queue-info p {
      margin: 0.25rem 0 0 0;
      color: #666;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  tables: Table[] = [];
  queue: QueueItem[] = [];
  loading = true;
  private refreshInterval: any;

  constructor(
    private tableService: TableService,
    private queueService: QueueService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadData();
    // Auto-refresh every 5 seconds
    this.refreshInterval = setInterval(() => this.loadData(), 5000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadData() {
    this.tableService.getAllTables().subscribe({
      next: (response) => {
        if (response.success) {
          this.tables = response.data;
        }
      }
    });

    this.queueService.getQueue().subscribe({
      next: (response) => {
        if (response.success) {
          this.queue = response.data;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getAvailableCount(): number {
    return this.tables.filter(t => t.status === 'available').length;
  }

  getOccupiedCount(): number {
    return this.tables.filter(t => t.status === 'occupied').length;
  }

  vacateTable(id: number) {
    this.tableService.vacateTable(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Table vacated successfully', 'Close', { duration: 3000 });
          this.loadData();
        }
      },
      error: () => {
        this.snackBar.open('Failed to vacate table', 'Close', { duration: 3000 });
      }
    });
  }

  seatNext(tableId: number) {
    if (this.queue.length === 0) return;
    const firstInQueue = this.queue[0];
    this.seatCustomer(firstInQueue);
  }

  seatCustomer(queueItem: QueueItem) {
    this.tableService.seatCustomer(queueItem.id, queueItem.current_customer_name).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Customer seated successfully10:57 PM', 'Close', { duration: 3000 });
this.loadData();
}
},
error: () => {
this.snackBar.open('Failed to seat customer', 'Close', { duration: 3000 });
}
});
}
}