import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { TableService } from '../../../services/table.service';
import { Table } from '../../../models/user.model';

@Component({
  selector: 'app-table-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    
    <div class="page-container">
      <div class="page-header">
        <h1>Manage Tables</h1>
        <p>Add, edit, or remove tables</p>
      </div>

      <div class="loading" *ngIf="loading">
        <mat-spinner></mat-spinner>
      </div>

      <div class="content" *ngIf="!loading">
        <!-- Add Table Form -->
        <mat-card class="add-table-card">
          <h2>{{ editingTable ? 'Edit Table' : 'Add New Table' }}</h2>
          
          <form (ngSubmit)="saveTable()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Table Number</mat-label>
              <input matInput [(ngModel)]="tableForm.table_number" name="table_number" required>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Capacity</mat-label>
              <input matInput type="number" [(ngModel)]="tableForm.capacity" name="capacity" required min="1">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Type</mat-label>
              <mat-select [(ngModel)]="tableForm.type" name="type" required>
                <mat-option value="regular">Regular</mat-option>
                <mat-option value="vip">VIP</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" class="submit-btn">
                {{ editingTable ? 'Update Table' : 'Add Table' }}
              </button>
              <button mat-stroked-button type="button" *ngIf="editingTable" (click)="cancelEdit()">
                Cancel
              </button>
            </div>
          </form>
        </mat-card>

        <!-- Tables List -->
        <div class="tables-section">
          <h2>All Tables ({{ tables.length }})</h2>
          
          <div class="tables-grid">
            <mat-card *ngFor="let table of tables" class="table-card">
              <div class="table-header">
                <div>
                  <h3>Table {{ table.table_number }}</h3>
                  <p class="capacity">👥 {{ table.capacity }} people</p>
                </div>
                <mat-chip class="status-chip" [class]="table.status">
                  {{ table.status }}
                </mat-chip>
              </div>

              <div class="table-type">
                <mat-chip [class.vip]="table.type === 'vip'">
                  {{ table.type === 'vip' ? '⭐ VIP' : '🍽️ Regular' }}
                </mat-chip>
              </div>

              <div class="table-info" *ngIf="table.current_customer_name">
                <p><strong>Customer:</strong> {{ table.current_customer_name }}</p>
              </div>

              <div class="table-actions">
                <button mat-raised-button color="primary" (click)="editTable(table)">
                  Edit
                </button>
                <button mat-raised-button color="warn" (click)="deleteTable(table.id)">
                  Delete
                </button>
              </div>
            </mat-card>
          </div>
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

    .add-table-card {
      padding: 2rem;
      border-radius: 15px;
      margin-bottom: 2rem;
    }

    .add-table-card h2 {
      margin: 0 0 1.5rem 0;
      color: #667eea;
    }

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .submit-btn {
      flex: 1;
      height: 50px;
      font-size: 1.1rem;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .tables-section h2 {
      color: white;
      margin-bottom: 1.5rem;
      font-size: 1.8rem;
    }

    .tables-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .table-card {
      padding: 1.5rem;
      border-radius: 15px;
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .table-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 1rem;
    }

    .table-header h3 {
      margin: 0;
      font-size: 1.8rem;
      color: #667eea;
    }

    .capacity {
      color: #666;
      margin: 0.5rem 0 0 0;
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
      background: #e0e0e0;
    }

    .table-type mat-chip.vip {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      font-weight: bold;
    }

    .table-info {
      padding: 1rem 0;
      border-top: 1px solid #eee;
      margin-top: 1rem;
    }

    .table-info p {
      margin: 0;
      color: #666;
    }

    .table-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .table-actions button {
      flex: 1;
    }
  `]
})
export class TableManagementComponent implements OnInit {
  tables: Table[] = [];
  loading = true;
  editingTable: Table | null = null;

  tableForm = {
    table_number: '',
    capacity: 2,
    type: 'regular'
  };

  constructor(
    private tableService: TableService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadTables();
  }

  loadTables() {
    this.loading = true;
    this.tableService.getAllTables().subscribe({
      next: (response) => {
        if (response.success) {
          this.tables = response.data;
        }
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load tables', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  saveTable() {
    if (!this.tableForm.table_number || !this.tableForm.capacity) {
      this.snackBar.open('Please fill in all fields', 'Close', { duration: 3000 });
      return;
    }

    if (this.editingTable) {
      // Update existing table
      this.tableService.updateTable(this.editingTable.id, this.tableForm).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Table updated successfully', 'Close', { duration: 3000 });
            this.resetForm();
            this.loadTables();
          }
        },
        error: (error) => {
          this.snackBar.open(error.error.message || 'Failed to update table', 'Close', { duration: 3000 });
        }
      });
    } else {
      // Create new table
      this.tableService.createTable(this.tableForm).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Table added successfully', 'Close', { duration: 3000 });
            this.resetForm();
            this.loadTables();
          }
        },
        error: (error) => {
          this.snackBar.open(error.error.message || 'Failed to add table', 'Close', { duration: 3000 });
        }
      });
    }
  }

  editTable(table: Table) {
    this.editingTable = table;
    this.tableForm = {
      table_number: table.table_number,
      capacity: table.capacity,
      type: table.type
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteTable(id: number) {
    if (!confirm('Are you sure you want to delete this table?')) return;

    this.tableService.deleteTable(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Table deleted successfully', 'Close', { duration: 3000 });
          this.loadTables();
        }
      },
      error: () => {
        this.snackBar.open('Failed to delete table', 'Close', { duration: 3000 });
      }
    });
  }

  cancelEdit() {
    this.resetForm();
  }

  resetForm() {
    this.editingTable = null;
    this.tableForm = {
      table_number: '',
      capacity: 2,
      type: 'regular'
    };
  }
}