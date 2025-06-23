import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">User Management</h1>
        <a routerLink="/admin" class="btn-secondary">Back to Admin</a>
      </div>

      @if (loading) {
        <div class="text-center py-8">
          <div class="text-gray-500">Loading users...</div>
        </div>
      } @else {
        <div class="card">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (user of users; track user.id) {
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span class="text-primary-600 font-medium">
                              {{ user.name.charAt(0).toUpperCase() }}
                            </span>
                          </div>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ user.email }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                            [class]="user.isAdmin ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'">
                        {{ user.isAdmin ? 'Admin' : 'User' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div class="flex space-x-2">
                        @if (editingUser?.id === user.id) {
                          <button (click)="saveUser(user)" class="text-green-600 hover:text-green-900">
                            Save
                          </button>
                          <button (click)="cancelEdit()" class="text-gray-600 hover:text-gray-900">
                            Cancel
                          </button>
                        } @else {
                          <button (click)="editUser(user)" class="text-indigo-600 hover:text-indigo-900">
                            Edit
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                  @if (editingUser?.id === user.id) {
                    <tr class="bg-gray-50">
                      <td colspan="4" class="px-6 py-4">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                              type="text"
                              [(ngModel)]="editingUser.name"
                              class="form-input"
                            >
                          </div>
                          <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                              type="email"
                              [(ngModel)]="editingUser.email"
                              class="form-input"
                            >
                          </div>
                          <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select [(ngModel)]="editingUser.isAdmin" class="form-input">
                              <option [value]="false">User</option>
                              <option [value]="true">Admin</option>
                            </select>
                          </div>
                        </div>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `
})
export class UserManagementComponent implements OnInit {
  private userService = inject(UserService);

  users: User[] = [];
  editingUser: User | null = null;
  loading = false;

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
      }
    });
  }

  editUser(user: User): void {
    this.editingUser = { ...user };
  }

  saveUser(originalUser: User): void {
    if (this.editingUser) {
      this.userService.updateUser(this.editingUser.id, {
        name: this.editingUser.name,
        email: this.editingUser.email,
        isAdmin: this.editingUser.isAdmin
      }).subscribe({
        next: () => {
          // Update the user in the list
          const index = this.users.findIndex(u => u.id === originalUser.id);
          if (index !== -1) {
            this.users[index] = { ...this.editingUser! };
          }
          this.editingUser = null;
        },
        error: (error) => {
          console.error('Error updating user:', error);
          alert('Error updating user');
        }
      });
    }
  }

  cancelEdit(): void {
    this.editingUser = null;
  }
}