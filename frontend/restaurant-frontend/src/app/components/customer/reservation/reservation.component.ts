import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { ReservationService } from '../../../services/reservation.service';
import { Reservation } from '../../../models/user.model';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>

    <div class="page-container">
      <div class="page-header">
        <h1>Reservations</h1>
        <p>Book your table in advance</p>
      </div>

      <div class="loading" *ngIf="loading">
        <mat-spinner></mat-spinner>
      </div>

      <div class="content" *ngIf="!loading">
        <!-- My Reservations -->
        <mat-card class="reservations-card">
          <h2>My Reservations</h2>

          <div class="empty-state" *ngIf="reservations.length === 0">
            <p>No reservations yet</p>
          </div>

          <div class="reservations-list" *ngIf="reservations.length > 0">
            <div *ngFor="let res of reservations" class="reservation-item">
              <div class="reservation-icon">📅</div>
              <div class="reservation-info">
                <h4>Table {{ res.table_number }}</h4>
                <p>{{ res.capacity }} people</p>
                <p class="time">{{ res.reservation_time | date:'medium' }}</p>
              </div>
              <button mat-raised-button color="warn" (click)="cancelReservation(res.id)">
                Cancel
              </button>
            </div>
          </div>
        </mat-card>

        <!-- Create Reservation -->
        <mat-card class="create-card">
          <h2>Make New Reservation</h2>

          <form (ngSubmit)="createReservation()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Your Name</mat-label>
              <input matInput [(ngModel)]="newReservation.customer_name" name="name" required>
            </mat-form-field>

            <!-- DATE PICKER -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Date</mat-label>
              <input
                matInput
                [matDatepicker]="picker"
                [(ngModel)]="selectedDate"
                name="date"
                required>
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <!-- TIME PICKER -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Time</mat-label>
              <input
                matInput
                type="time"
                [(ngModel)]="selectedTime"
                name="time"
                required>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Number of People</mat-label>
              <mat-select [(ngModel)]="newReservation.capacity" name="capacity" required>
                <mat-option [value]="2">2 People</mat-option>
                <mat-option [value]="4">4 People</mat-option>
                <mat-option [value]="6">6 People</mat-option>
                <mat-option [value]="8">8 People</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" class="full-width submit-btn">
              Create Reservation
            </button>
          </form>
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
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    @media (max-width: 768px) {
      .content {
        grid-template-columns: 1fr;
      }
    }

    .reservations-card, .create-card {
      padding: 2rem;
      border-radius: 15px;
    }

    h2 {
      margin: 0 0 1.5rem 0;
      color: #667eea;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #666;
    }

    .reservations-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .reservation-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 10px;
      transition: transform 0.2s;
    }

    .reservation-item:hover {
      transform: translateX(5px);
    }

    .reservation-icon {
      font-size: 2.5rem;
    }

    .reservation-info {
      flex: 1;
    }

    .reservation-info h4 {
      margin: 0;
      color: #333;
    }

    .reservation-info p {
      margin: 0.25rem 0;
      color: #666;
    }

    .time {
      font-weight: bold;
      color: #667eea;
    }

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .submit-btn {
      height: 50px;
      font-size: 1.1rem;
      font-weight: bold;
      margin-top: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
  `]
})
export class ReservationComponent implements OnInit {

  reservations: Reservation[] = [];
  loading = true;

  selectedDate!: Date;
  selectedTime!: string;

  newReservation = {
    customer_name: '',
    reservation_time: '',
    capacity: 2
  };

  constructor(
    private reservationService: ReservationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadReservations();
  }

  loadReservations() {
    this.loading = true;
    this.reservationService.getReservations().subscribe({
      next: (response) => {
        if (response.success) {
          this.reservations = response.data;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  createReservation() {
    if (!this.newReservation.customer_name || !this.selectedDate || !this.selectedTime) {
      this.snackBar.open('Please fill in all fields', 'Close', { duration: 3000 });
      return;
    }

    const date = new Date(this.selectedDate);
    const [hours, minutes] = this.selectedTime.split(':');
    date.setHours(+hours, +minutes);

    this.newReservation.reservation_time = date.toISOString();

    this.reservationService.createReservation(this.newReservation).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Reservation created successfully!', 'Close', { duration: 3000 });
          this.newReservation = { customer_name: '', reservation_time: '', capacity: 2 };
          this.selectedDate = undefined as any;
          this.selectedTime = '';
          this.loadReservations();
        }
      },
      error: (error) => {
        this.snackBar.open(error.error.message || 'Failed to create reservation', 'Close', { duration: 3000 });
      }
    });
  }

  cancelReservation(id: number) {
    if (!confirm('Cancel this reservation?')) return;

    this.reservationService.cancelReservation(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Reservation cancelled', 'Close', { duration: 3000 });
          this.loadReservations();
        }
      },
      error: () => {
        this.snackBar.open('Failed to cancel reservation', 'Close', { duration: 3000 });
      }
    });
  }
}
