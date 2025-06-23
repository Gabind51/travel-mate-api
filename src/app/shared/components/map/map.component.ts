import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #mapContainer class="leaflet-container"></div>
  `
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  @Input() latitude: number = 48.8566;
  @Input() longitude: number = 2.3522;
  @Input() editable: boolean = false;
  @Output() locationSelected = new EventEmitter<{lat: number, lng: number}>();

  private map!: L.Map;
  private marker?: L.Marker;

  ngOnInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    // Fix for default markers
    const iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png';
    const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';
    const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;

    this.map = L.map(this.mapContainer.nativeElement).setView([this.latitude, this.longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.addMarker(this.latitude, this.longitude);

    if (this.editable) {
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.updateMarker(e.latlng.lat, e.latlng.lng);
        this.locationSelected.emit({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
    }
  }

  private addMarker(lat: number, lng: number): void {
    this.marker = L.marker([lat, lng]).addTo(this.map);
  }

  private updateMarker(lat: number, lng: number): void {
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.addMarker(lat, lng);
    }
  }

  updateLocation(lat: number, lng: number): void {
    this.latitude = lat;
    this.longitude = lng;
    this.map.setView([lat, lng], 13);
    this.updateMarker(lat, lng);
  }
}