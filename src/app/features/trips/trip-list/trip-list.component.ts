import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TripService } from '../../../core/services/trip.service';
import { Trip } from '../../../core/models/trip.model';

@Component({
  selector: 'app-trip-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">My Trips</h1>
        <a routerLink="/trips/create" class="btn-primary">Create New Trip</a>
      </div>

      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            placeholder="Search trips..."
            class="form-input"
          >
        </div>
        <button (click)="loadTrips()" class="btn-secondary">Refresh</button>
      </div>

      @if (loading) {
        <div class="text-center py-8">
          <div class="text-gray-500">Loading trips...</div>
        </div>
      } @else if (trips.length === 0) {
        <div class="text-center py-12">
          <div class="text-gray-500 mb-4">No trips found</div>
          <a routerLink="/trips/create" class="btn-primary">Create Your First Trip</a>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (trip of trips; track trip.id) {
            <div class="card hover:shadow-lg transition-shadow">
              <div class="flex justify-between items-start mb-3">
                <h3 class="text-xl font-semibold text-gray-900">{{ trip.title }}</h3>
                <div class="flex space-x-2">
                  <a [routerLink]="['/trips/edit', trip.id]" class="text-blue-600 hover:text-blue-800">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </a>
                  <button (click)="deleteTrip(trip.id!)" class="text-red-600 hover:text-red-800">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <p class="text-gray-600 mb-3">{{ trip.description }}</p>
              
              <div class="space-y-2 text-sm text-gray-500">
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  {{ trip.location }}
                </div>
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  {{ formatDate(trip.startDate) }} - {{ formatDate(trip.endDate) }}
                </div>
              </div>
              
              <div class="mt-4 pt-4 border-t">
                <a [routerLink]="['/trips', trip.id]" class="btn-primary w-full text-center">View Details</a>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class TripListComponent implements OnInit {
  private tripService = inject(TripService);

  trips: Trip[] = [];
  loading = false;
  searchQuery = '';

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips(): void {
    this.loading = true;
    this.tripService.getAllTrips().subscribe({
      next: (trips) => {
        this.trips = trips;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading trips:', error);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.tripService.searchTrips({ query: this.searchQuery }).subscribe({
        next: (trips) => {
          this.trips = trips;
        },
        error: (error) => {
          console.error('Error searching trips:', error);
        }
      });
    } else {
      this.loadTrips();
    }
  }

  deleteTrip(id: number): void {
    if (confirm('Are you sure you want to delete this trip?')) {
      this.tripService.deleteTrip(id).subscribe({
        next: () => {
          this.trips = this.trips.filter(trip => trip.id !== id);
        },
        error: (error) => {
          console.error('Error deleting trip:', error);
        }
      });
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}