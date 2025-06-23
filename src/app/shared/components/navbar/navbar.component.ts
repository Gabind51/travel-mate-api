import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white shadow-lg">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold text-primary-600">TravelMate</h1>
            @if (authService.currentUser()) {
              <div class="hidden md:flex space-x-4">
                <a routerLink="/dashboard" routerLinkActive="text-primary-600" class="text-gray-700 hover:text-primary-600 transition-colors">Dashboard</a>
                <a routerLink="/trips" routerLinkActive="text-primary-600" class="text-gray-700 hover:text-primary-600 transition-colors">My Trips</a>
                <a routerLink="/countdown" routerLinkActive="text-primary-600" class="text-gray-700 hover:text-primary-600 transition-colors">Countdown</a>
                @if (authService.isAdmin()) {
                  <a routerLink="/admin" routerLinkActive="text-primary-600" class="text-gray-700 hover:text-primary-600 transition-colors">Admin</a>
                }
              </div>
            }
          </div>
          
          <div class="flex items-center space-x-4">
            @if (authService.currentUser(); as user) {
              <span class="text-gray-700">Welcome, {{ user.name }}</span>
              <button (click)="logout()" class="btn-secondary">Logout</button>
            } @else {
              <a routerLink="/login" class="btn-primary">Login</a>
              <a routerLink="/register" class="btn-secondary">Register</a>
            }
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}