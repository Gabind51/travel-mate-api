import { Routes } from '@angular/router';

export const tripsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./trip-list/trip-list.component').then(m => m.TripListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./trip-form/trip-form.component').then(m => m.TripFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./trip-form/trip-form.component').then(m => m.TripFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./trip-detail/trip-detail.component').then(m => m.TripDetailComponent)
  }
];