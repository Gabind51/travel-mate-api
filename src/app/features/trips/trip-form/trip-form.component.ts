import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TripService } from '../../../core/services/trip.service';
import { Trip } from '../../../core/models/trip.model';
import { MapComponent } from '../../../shared/components/map/map.component';

@Component({
  selector: 'app-trip-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MapComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">
          {{ isEditMode ? 'Edit Trip' : 'Create New Trip' }}
        </h1>
        <button (click)="goBack()" class="btn-secondary">Back</button>
      </div>

      <form [formGroup]="tripForm" (ngSubmit)="onSubmit()" class="space-y-6">
        @if (error) {
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {{ error }}
          </div>
        }

        <div class="card">
          <h2 class="text-xl font-semibold mb-4">Trip Information</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                id="title"
                type="text"
                formControlName="title"
                class="form-input"
                placeholder="Enter trip title"
              >
              @if (tripForm.get('title')?.invalid && tripForm.get('title')?.touched) {
                <p class="mt-1 text-sm text-red-600">Title is required</p>
              }
            </div>

            <div>
              <label for="location" class="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input
                id="location"
                type="text"
                formControlName="location"
                class="form-input"
                placeholder="Enter location"
              >
              @if (tripForm.get('location')?.invalid && tripForm.get('location')?.touched) {
                <p class="mt-1 text-sm text-red-600">Location is required</p>
              }
            </div>

            <div>
              <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                id="startDate"
                type="date"
                formControlName="startDate"
                class="form-input"
              >
              @if (tripForm.get('startDate')?.invalid && tripForm.get('startDate')?.touched) {
                <p class="mt-1 text-sm text-red-600">Start date is required</p>
              }
            </div>

            <div>
              <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input
                id="endDate"
                type="date"
                formControlName="endDate"
                class="form-input"
              >
              @if (tripForm.get('endDate')?.invalid && tripForm.get('endDate')?.touched) {
                <p class="mt-1 text-sm text-red-600">End date is required</p>
              }
            </div>
          </div>

          <div class="mt-4">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="description"
              formControlName="description"
              rows="3"
              class="form-input"
              placeholder="Describe your trip..."
            ></textarea>
          </div>

          <div class="mt-4">
            <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              id="notes"
              formControlName="notes"
              rows="3"
              class="form-input"
              placeholder="Additional notes..."
            ></textarea>
          </div>
        </div>

        <div class="card">
          <h2 class="text-xl font-semibold mb-4">Location on Map</h2>
          <p class="text-sm text-gray-600 mb-4">Click on the map to set the exact location of your trip</p>
          
          <app-map
            #mapComponent
            [latitude]="tripForm.get('latitude')?.value || 48.8566"
            [longitude]="tripForm.get('longitude')?.value || 2.3522"
            [editable]="true"
            (locationSelected)="onLocationSelected($event)"
          ></app-map>

          <div class="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label for="latitude" class="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                id="latitude"
                type="number"
                step="any"
                formControlName="latitude"
                class="form-input"
                readonly
              >
            </div>
            <div>
              <label for="longitude" class="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                id="longitude"
                type="number"
                step="any"
                formControlName="longitude"
                class="form-input"
                readonly
              >
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-4">
          <button type="button" (click)="goBack()" class="btn-secondary">Cancel</button>
          <button
            type="submit"
            [disabled]="tripForm.invalid || loading"
            class="btn-primary disabled:opacity-50"
          >
            {{ loading ? 'Saving...' : (isEditMode ? 'Update Trip' : 'Create Trip') }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class TripFormComponent implements OnInit {
  @ViewChild('mapComponent') mapComponent!: MapComponent;

  private fb = inject(FormBuilder);
  private tripService = inject(TripService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  tripForm: FormGroup;
  loading = false;
  error = '';
  isEditMode = false;
  tripId?: number;

  constructor() {
    this.tripForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      location: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      latitude: [48.8566, Validators.required],
      longitude: [2.3522, Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.tripId = +id;
      this.loadTrip();
    }
  }

  private loadTrip(): void {
    if (this.tripId) {
      this.tripService.getTripById(this.tripId).subscribe({
        next: (trip) => {
          this.tripForm.patchValue({
            title: trip.title,
            description: trip.description,
            location: trip.location,
            startDate: trip.startDate,
            endDate: trip.endDate,
            latitude: trip.latitude,
            longitude: trip.longitude,
            notes: trip.notes
          });
          
          // Update map location
          if (this.mapComponent) {
            this.mapComponent.updateLocation(trip.latitude, trip.longitude);
          }
        },
        error: (error) => {
          this.error = 'Error loading trip';
          console.error('Error loading trip:', error);
        }
      });
    }
  }

  onLocationSelected(location: {lat: number, lng: number}): void {
    this.tripForm.patchValue({
      latitude: location.lat,
      longitude: location.lng
    });
  }

  onSubmit(): void {
    if (this.tripForm.valid) {
      this.loading = true;
      this.error = '';

      const tripData: Trip = this.tripForm.value;

      const operation = this.isEditMode
        ? this.tripService.updateTrip(this.tripId!, tripData)
        : this.tripService.createTrip(tripData);

      operation.subscribe({
        next: () => {
          this.router.navigate(['/trips']);
        },
        error: (error) => {
          this.error = error.error?.error || 'Error saving trip';
          this.loading = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/trips']);
  }
}