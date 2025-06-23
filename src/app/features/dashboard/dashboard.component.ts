import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TripService } from '../../core/services/trip.service';
import { AuthService } from '../../core/services/auth.service';
import { Trip } from '../../core/models/trip.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-8">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Welcome to TravelMate</h1>
        <p class="text-xl text-gray-600">Plan and manage your amazing trips</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="card text-center">
          <div class="text-3xl font-bold text-primary-600 mb-2">{{ totalTrips }}</div>
          <div class="text-gray-600">Total Trips</div>
        </div>
        
        <div class="card text-center">
          <div class="text-3xl font-bold text-green-600 mb-2">{{ upcomingTrips }}</div>
          <div class="text-gray-600">Upcoming Trips</div>
        </div>
        
        <div class="card text-center">
          <div class="text-3xl font-bold text-blue-600 mb-2">{{ completedTrips }}</div>
          <div class="text-gray-600">Completed Trips</div>
        </div>
        
        <div class="card text-center">
          <div class="text-3xl font-bold text-purple-600 mb-2">{{ countriesVisited }}</div>
          <div class="text-gray-600">Countries</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="card">
          <h2 class="text-2xl font-bold mb-4">Recent Trips</h2>
          @if (recentTrips.length > 0) {
            <div class="space-y-3">
              @for (trip of recentTrips; track trip.id) {
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 class="font-semibold">{{ trip.title }}</h3>
                    <p class="text-sm text-gray-600">{{ trip.location }}</p>
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ formatDate(trip.startDate) }}
                  </div>
                </div>
              }
            </div>
          } @else {
            <p class="text-gray-500">No trips yet. Create your first trip!</p>
          }
          <div class="mt-4">
            <a routerLink="/trips" class="btn-primary">View All Trips</a>
          </div>
        </div>

        <div class="card">
          <h2 class="text-2xl font-bold mb-4">Quick Actions</h2>
          <div class="space-y-3">
            <a routerLink="/trips/create" class="block w-full btn-primary text-center">
              Create New Trip
            </a>
            <a routerLink="/countdown" class="block w-full btn-secondary text-center">
              View Countdown
            </a>
            <a routerLink="/trips" class="block w-full btn-secondary text-center">
              Manage Trips
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private tripService = inject(TripService);
  private authService = inject(AuthService);

  trips: Trip[] = [];
  totalTrips = 0;
  upcomingTrips = 0;
  completedTrips = 0;
  countriesVisited = 0;
  recentTrips: Trip[] = [];

  ngOnInit(): void {
    this.loadTrips();
  }

  private loadTrips(): void {
    this.tripService.getAllTrips().subscribe({
      next: (trips) => {
        this.trips = trips;
        this.calculateStats();
      },
      error: (error) => {
        console.error('Error loading trips:', error);
      }
    });
  }

  private calculateStats(): void {
    const now = new Date();
    this.totalTrips = this.trips.length;
    
    this.upcomingTrips = this.trips.filter(trip => 
      new Date(trip.startDate) > now
    ).length;
    
    this.completedTrips = this.trips.filter(trip => 
      new Date(trip.endDate) < now
    ).length;
    
    const locations = new Set(this.trips.map(trip => trip.location));
    this.countriesVisited = locations.size;
    
    this.recentTrips = this.trips
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 5);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}