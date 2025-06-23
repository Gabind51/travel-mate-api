export interface Trip {
  id?: number;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  longitude: number;
  latitude: number;
  notes: string;
  userId?: number;
}

export interface TripSearchParams {
  query?: string;
}