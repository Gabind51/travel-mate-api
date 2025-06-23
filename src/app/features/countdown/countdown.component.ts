import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TripService } from '../../core/services/trip.service';
import { Trip } from '../../core/models/trip.model';

interface TripCountdown {
  trip: Trip;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isStarted: boolean;
  isCompleted: boolean;
}

@Component({
  selector: 'app-countdown',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Trip Countdown</h1>
        <p class="text-gray-600">Keep track of your upcoming adventures</p>
      </div>

      @if (loading) {
        <div class="text-center py-8">
          <div class="text-gray-500">Loading trips...</div>
        </div>
      } @else if (upcomingTrips.length === 0) {
        <div class="text-center py-12">
          <div class="text-gray-500 mb-4">No upcoming trips found</div>
          <a routerLink="/trips/create" class="btn-primary">Plan Your Next Adventure</a>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          @for (tripCountdown of upcomingTrips; track tripCountdown.trip.id) {
            <div class="card">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-xl font-semibold text-gray-900">{{ tripCountdown.trip.title }}</h3>
                  <p class="text-gray-600">{{ tripCountdown.trip.location }}</p>
                </div>
                <a [routerLink]="['/trips', tripCountdown.trip.id]" class="text-primary-600 hover:text-primary-800">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                </a>
              </div>

              <div class="text-center mb-4">
                <div class="text-sm text-gray-500 mb-2">
                  {{ formatDate(tripCountdown.trip.startDate) }}
                </div>
                
                @if (tripCountdown.isCompleted) {
                  <div class="text-green-600 font-semibold">Trip Completed!</div>
                } @else if (tripCountdown.isStarted) {
                  <div class="text-blue-600 font-semibold">Trip in Progress!</div>
                } @else {
                  <div class="grid grid-cols-4 gap-2 text-center">
                    <div class="bg-primary-50 rounded-lg p-3">
                      <div class="text-2xl font-bold text-primary-600">{{ tripCountdown.days }}</div>
                      <div class="text-xs text-gray-500">Days</div>
                    </div>
                    <div class="bg-primary-50 rounded-lg p-3">
                      <div class="text-2xl font-bold text-primary-600">{{ tripCountdown.hours }}</div>
                      <div class="text-xs text-gray-500">Hours</div>
                    </div>
                    <div class="bg-primary-50 rounded-lg p-3">
                      <div class="text-2xl font-bold text-primary-600">{{ tripCountdown.minutes }}</div>
                      <div class="text-xs text-gray-500">Minutes</div>
                    </div>
                    <div class="bg-primary-50 rounded-lg p-3">
                      <div class="text-2xl font-bold text-primary-600">{{ tripCountdown.seconds }}</div>
                      <div class="text-xs text-gray-500">Seconds</div>
                    </div>
                  </div>
                }
              </div>

              @if (tripCountdown.trip.description) {
                <p class="text-gray-600 text-sm">{{ tripCountdown.trip.description }}</p>
              }
            </div>
          }
        </div>
      }

      @if (currentTrips.length > 0) {
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">Current Trips</h2>
          <div class="space-y-3">
            @for (trip of currentTrips; track trip.id) {
              <div class="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <h3 class="font-semibold text-blue-900">{{ trip.title }}</h3>
                  <p class="text-sm text-blue-700">{{ trip.location }}</p>
                </div>
                <div class="text-sm text-blue-600">
                  Ends {{ formatDate(trip.endDate) }}
                </div>
              </div>
            }
          </div>
        </div>
      }

      @if (completedTrips.length > 0) {
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">Recently Completed</h2>
          <div class="space-y-3">
            @for (trip of completedTrips.slice(0, 5); track trip.id) {
              <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <h3 class="font-semibold text-green-900">{{ trip.title }}</h3>
                  <p class="text-sm text-green-700">{{ trip.location }}</p>
                </div>
                <div class="text-sm text-green-600">
                  Completed {{ formatDate(trip.endDate) }}
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class CountdownComponent implements OnInit, OnDestroy {
  private tripService = inject(TripService);
  private intervalId?: number;

  trips: Trip[] = [];
  upcomingTrips: TripCountdown[] = [];
  currentTrips: Trip[] = [];
  completedTrips: Trip[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadTrips();
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private loadTrips(): void {
    this.loading = true;
    this.tripService.getAllTrips().subscribe({
      next: (trips) => {
        this.trips = trips;
        this.categorizeTrips();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading trips:', error);
        this.loading = false;
      }
    });
  }

  private categorizeTrips(): void {
    const now = new Date();
    
    this.upcomingTrips = [];
    this.currentTrips = [];
    this.completedTrips = [];

    this.trips.forEach(trip => {
      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.endDate);

      if (endDate < now) {
        this.completedTrips.push(trip);
      } else if (startDate <= now && endDate >= now) {
        this.currentTrips.push(trip);
      } else if (startDate > now) {
        this.upcomingTrips.push(this.createTripCountdown(trip));
      }
    });

    // Sort by start date
    this.upcomingTrips.sort((a, b) => 
      new Date(a.trip.startDate).getTime() - new Date(b.trip.startDate).getTime()
    );
    
    this.completedTrips.sort((a, b) => 
      new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
    );
  }

  private createTripCountdown(trip: Trip): TripCountdown {
    const now = new Date();
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    
    const isStarted = startDate <= now;
    const isCompleted = endDate < now;
    
    let timeLeft = 0;
    if (!isStarted) {
      timeLeft = startDate.getTime() - now.getTime();
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return {
      trip,
      days: Math.max(0, days),
      hours: Math.max(0, hours),
      minutes: Math.max(0, minutes),
      seconds: Math.max(0, seconds),
      isStarted,
      isCompleted
    };
  }

  private startCountdown(): void {
    this.intervalId = window.setInterval(() => {
      this.upcomingTrips = this.upcomingTrips.map(tripCountdown => 
        this.createTripCountdown(tripCountdown.trip)
      );
      
      // Re-categorize if any trip has started
      const hasStartedTrips = this.upcomingTrips.some(tc => tc.isStarted);
      if (hasStartedTrips) {
        this.categorizeTrips();
      }
    }, 1000);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}