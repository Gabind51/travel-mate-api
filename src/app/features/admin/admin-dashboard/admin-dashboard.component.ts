import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TripService } from '../../../core/services/trip.service';
import { UserService } from '../../../core/services/user.service';
import { Trip } from '../../../core/models/trip.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
        <p class="text-gray-600">Manage users and system settings</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="card text-center">
          <div class="text-3xl font-bold text-blue-600 mb-2">{{ totalUsers }}</div>
          <div class="text-gray-600">Total Users</div>
        </div>
        
        <div class="card text-center">
          <div class="text-3xl font-bold text-green-600 mb-2">{{ totalTrips }}</div>
          <div class="text-gray-600">Total Trips</div>
        </div>
        
        <div class="card text-center">
          <div class="text-3xl font-bold text-purple-600 mb-2">{{ adminUsers }}</div>
          <div class="text-gray-600">Admin Users</div>
        </div>
        
        <div class="card text-center">
          <div class="text-3xl font-bold text-orange-600 mb-2">{{ activeTrips }}</div>
          <div class="text-gray-600">Active Trips</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="card">
          <h2 class="text-2xl font-bold mb-4">Quick Actions</h2>
          <div class="space-y-3">
            <a routerLink="/admin/users" class="block w-full btn-primary text-center">
              Manage Users
            </a>
            <button (click)="resetDatabase()" class="block w-full btn-danger text-center">
              Reset Database
            </button>
          </div>
        </div>

        <div class="card">
          <h2 class="text-2xl font-bold mb-4">Recent Activity</h2>
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
            <p class="text-gray-500">No recent activity</p>
          }
        </div>
      </div>

      @if (resetLoading) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded-lg">
            <div class="text-center">
              <div class="text-lg font-semibold mb-2">Resetting Database...</div>
              <div class="text-gray-600">Please wait...</div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private tripService = inject(TripService);
  private userService = inject(UserService);

  totalUsers = 0;
  totalTrips = 0;
  adminUsers = 0;
  activeTrips = 0;
  recentTrips: Trip[] = [];
  resetLoading = false;

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    // Load users
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.totalUsers = users.length;
        this.adminUsers = users.filter(user => user.isAdmin).length;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });

    // Load trips
    this.tripService.getAllTrips().subscribe({
      next: (trips) => {
        this.totalTrips = trips.length;
        const now = new Date();
        this.activeTrips = trips.filter(trip => 
          new Date(trip.startDate) <= now && new Date(trip.endDate) >= now
        ).length;
        
        this.recentTrips = trips
          .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
          .slice(0, 5);
      },
      error: (error) => {
        console.error('Error loading trips:', error);
      }
    });
  }

  resetDatabase(): void {
    if (confirm('Are you sure you want to reset the database? This action cannot be undone.')) {
      this.resetLoading = true;
      this.userService.resetDatabase().subscribe({
        next: () => {
          this.resetLoading = false;
          alert('Database reset successfully');
          this.loadStats();
        },
        error: (error) => {
          this.resetLoading = false;
          console.error('Error resetting database:', error);
          alert('Error resetting database');
        }
      });
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}