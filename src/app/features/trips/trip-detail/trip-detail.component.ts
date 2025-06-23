import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TripService } from '../../../core/services/trip.service';
import { Trip } from '../../../core/models/trip.model';
import { MapComponent } from '../../../shared/components/map/map.component';

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MapComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      @if (loading) {
        <div class="text-center py-8">
          <div class="text-gray-500">Loading trip details...</div>
        </div>
      } @else if (trip) {
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-900">{{ trip.title }}</h1>
          <div class="flex space-x-3">
            <a [routerLink]="['/trips/edit', trip.id]" class="btn-secondary">Edit</a>
            <button (click)="deleteTrip()" class="btn-danger">Delete</button>
            <button (click)="goBack()" class="btn-secondary">Back</button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="space-y-6">
            <div class="card">
              <h2 class="text-xl font-semibold mb-4">Trip Information</h2>
              <div class="space-y-3">
                <div>
                  <span class="font-medium text-gray-700">Location:</span>
                  <span class="ml-2">{{ trip.location }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-700">Start Date:</span>
                  <span class="ml-2">{{ formatDate(trip.startDate) }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-700">End Date:</span>
                  <span class="ml-2">{{ formatDate(trip.endDate) }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-700">Duration:</span>
                  <span class="ml-2">{{ calculateDuration() }} days</span>
                </div>
                <div>
                  <span class="font-medium text-gray-700">Coordinates:</span>
                  <span class="ml-2">{{ trip.latitude.toFixed(6) }}, {{ trip.longitude.toFixed(6) }}</span>
                </div>
              </div>
            </div>

            @if (trip.description) {
              <div class="card">
                <h2 class="text-xl font-semibold mb-4">Description</h2>
                <p class="text-gray-700 whitespace-pre-wrap">{{ trip.description }}</p>
              </div>
            }

            @if (trip.notes) {
              <div class="card">
                <h2 class="text-xl font-semibold mb-4">Notes</h2>
                <p class="text-gray-700 whitespace-pre-wrap">{{ trip.notes }}</p>
              </div>
            }
          </div>

          <div class="card">
            <h2 class="text-xl font-semibold mb-4">Location</h2>
            <app-map
              [latitude]="trip.latitude"
              [longitude]="trip.longitude"
              [editable]="false"
            ></app-map>
          </div>
        </div>
      } @else {
        <div class="text-center py-8">
          <div class="text-gray-500">Trip not found</div>
          <button (click)="goBack()" class="btn-primary mt-4">Go Back</button>
        </div>
      }
    </div>
  `
})
export class TripDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tripService = inject(TripService);

  trip: Trip | null = null;
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTrip(+id);
    }
  }

  private loadTrip(id: number): void {
    this.loading = true;
    this.tripService.getTripById(id).subscribe({
      next: (trip) => {
        this.trip = trip;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading trip:', error);
        this.loading = false;
      }
    });
  }

  deleteTrip(): void {
    if (this.trip && confirm('Are you sure you want to delete this trip?')) {
      this.tripService.deleteTrip(this.trip.id!).subscribe({
        next: () => {
          this.router.navigate(['/trips']);
        },
        error: (error) => {
          console.error('Error deleting trip:', error);
        }
      });
    }
  }

  calculateDuration(): number {
    if (!this.trip) return 0;
    const start = new Date(this.trip.startDate);
    const end = new Date(this.trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  goBack(): void {
    this.router.navigate(['/trips']);
  }
}