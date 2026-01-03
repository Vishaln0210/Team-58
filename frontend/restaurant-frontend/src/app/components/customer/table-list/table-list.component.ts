import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { TableService } from '../../../services/table.service';
import { QueueService } from '../../../services/queue.service';
import { Table } from '../../../models/user.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-table-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatIconModule,
    NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    
    <div class="page-container">
      <div class="page-header">
        <h1>🍽️ Available Tables</h1>
        <p>Find your perfect spot to dine</p>
      </div>

      <div class="loading" *ngIf="loading">
        <mat-spinner></mat-spinner>
      </div>

      <div class="stats-bar" *ngIf="!loading">
        <div class="stat-item">
          <mat-icon class="stat-icon available">check_circle</mat-icon>
          <span class="stat-label">Available: <strong>{{ getAvailableCount() }}</strong></span>
        </div>
        <div class="stat-item">
          <mat-icon class="stat-icon occupied">people</mat-icon>
          <span class="stat-label">Occupied: <strong>{{ getOccupiedCount() }}</strong></span>
        </div>
        <div class="stat-item">
          <mat-icon class="stat-icon reserved">event</mat-icon>
          <span class="stat-label">Reserved: <strong>{{ getReservedCount() }}</strong></span>
        </div>
      </div>

      <div class="tables-grid" *ngIf="!loading">
        <mat-card *ngFor="let table of tables" class="table-card" [class.available]="table.status === 'available'">
          <div class="table-header">
            <div>
              <h2>Table {{ table.table_number }}</h2>
              <p class="capacity">
                <mat-icon class="inline-icon">people</mat-icon>
                {{ table.capacity }} people
              </p>
            </div>
            <mat-chip class="status-chip" [class]="table.status">
              {{ table.status }}
            </mat-chip>
          </div>

          <div class="table-type">
            <mat-chip [class.vip]="table.type === 'vip'">
              <mat-icon class="chip-icon">{{ table.type === 'vip' ? 'star' : 'restaurant' }}</mat-icon>
              {{ table.type === 'vip' ? 'VIP' : 'Regular' }}
            </mat-chip>
          </div>

          <div class="table-actions" *ngIf="table.status === 'available'">
            <button mat-raised-button color="primary" (click)="joinQueue(table)" class="action-btn">
              <mat-icon>queue</mat-icon>
              Join Queue
            </button>
          </div>

          <div class="table-info" *ngIf="table.status !== 'available'">
            <div class="info-item" *ngIf="table.current_customer_name">
              <mat-icon class="info-icon">person</mat-icon>
              <span>{{ table.current_customer_name }}</span>
            </div>
            <div class="info-item" *ngIf="table.reservation_time">
              <mat-icon class="info-icon">schedule</mat-icon>
              <span>{{ table.reservation_time | date:'short' }}</span>
            </div>
            <div class="info-item" *ngIf="table.queue_position">
              <mat-icon class="info-icon">format_list_numbered</mat-icon>
              <span>Queue Position: #{{ table.queue_position }}</span>
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

    .stats-bar {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(10px);
      padding: 1rem 2rem;
      border-radius: 50px;
      color: white;
    }

    .stat-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    .stat-icon.available {
      color: #4caf50;
    }

    .stat-icon.occupied {
      color: #f44336;
    }

    .stat-icon.reserved {
      color: #ff9800;
    }

    .stat-label {
      font-size: 1rem;
    }

    .tables-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .table-card {
      padding: 1.5rem;
      border-radius: 15px;
      transition: all 0.3s;
      border: 2px solid transparent;
    }

    .table-card.available {
      border-color: #4caf50;
    }

    .table-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 1rem;
    }

    .table-header h2 {
      margin: 0;
      font-size: 1.8rem;
      color: #667eea;
    }

    .capacity {
      color: #666;
      margin: 0.5rem 0 0 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .inline-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
      vertical-align: middle;
    }

    .status-chip {
      font-weight: bold;
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

    .table-type {
      margin: 1rem 0;
    }

    .table-type mat-chip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .table-type mat-chip.vip {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      font-weight: bold;
    }

    .chip-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }

    .action-btn {
      width: 100%;
      height: 45px;
      font-size: 1rem;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .action-btn mat-icon {
      margin-right: 0.5rem;
    }

    .table-info {
      padding-top: 1rem;
      border-top: 1px solid #eee;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #666;
    }

    .info-icon {
      color: #667eea;
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }
  `]
})
export class TableListComponent implements OnInit {
  tables: Table[] = [];
  loading = true;

  constructor(
    private tableService: TableService,
    private queueService: QueueService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadTables();
    // Auto-refresh every 10 seconds
    setInterval(() => this.loadTables(), 10000);
  }

  loadTables() {
    this.tableService.getAllTables().subscribe({
      next: (response) => {
        if (response.success) {
          this.tables = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load tables', 'Close', { duration: 3000 });
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

  getReservedCount(): number {
    return this.tables.filter(t => t.status === 'reserved').length;
  }

  joinQueue(table: Table) {
    const customerName = prompt('Enter your name to join the queue:');
    if (!customerName || customerName.trim() === '') {
      this.snackBar.open('Name is required to join queue', 'Close', { duration: 3000 });
      return;
    }

    const data = {
      table_id: table.id,
      customer_name: customerName.trim(),
      capacity: table.capacity
    };

    this.queueService.joinQueue(data).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open(`✅ Joined queue! Position: #${response.position}`, 'Close', { duration: 4000 });
          this.loadTables();
        }
      },
      error: (error) => {
        this.snackBar.open(error.error.message || 'Failed to join queue', 'Close', { duration: 3000 });
      }
    });
  }
}