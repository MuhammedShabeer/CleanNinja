import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContentService } from '../../services/content.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.html',
  styleUrls: ['./booking.css'],
  standalone: false
})
export class Booking implements OnInit, AfterViewInit {
  public silverPrice: number = 24.99;
  public silverFeatures: string[] = [];
  
  public goldPrice: number = 44.99;
  public goldFeatures: string[] = [];

  public selectedPackage: string = '';
  public customerName: string = '';
  public phone: string = '';
  
  public selectedLat: number = 53.4084; // Liverpool default
  public selectedLng: number = -2.9916;

  private map: any;
  private marker: any;

  public isSubmitting: boolean = false;
  public submitSuccess: boolean = false;

  constructor(
    private contentService: ContentService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.contentService.loadInitialContent().subscribe(() => {
        this.silverPrice = parseFloat(this.contentService.getValue('SilverPackagePrice', '24.99'));
        this.silverFeatures = this.contentService.getParsedValue<string[]>('SilverPackageFeatures', ['Exterior Foam Wash', 'Wheel Cleaning', 'Tire Dressing', 'Interior Vacuum']);
        
        this.goldPrice = parseFloat(this.contentService.getValue('GoldPackagePrice', '44.99'));
        this.goldFeatures = this.contentService.getParsedValue<string[]>('GoldPackageFeatures', ['Complete Interior/Exterior Care', 'Wax Protection', 'Upholstery Cleaning', 'Engine Bay Cleaning']);
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';
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

    this.map = L.map('booking-map').setView([this.selectedLat, this.selectedLng], 13);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(this.map);

    this.marker = L.marker([this.selectedLat, this.selectedLng], { draggable: true }).addTo(this.map);

    this.marker.on('dragend', (event: any) => {
        const position = this.marker.getLatLng();
        this.selectedLat = position.lat;
        this.selectedLng = position.lng;
    });

    this.map.on('click', (e: any) => {
        this.selectedLat = e.latlng.lat;
        this.selectedLng = e.latlng.lng;
        this.marker.setLatLng(e.latlng);
    });
  }

  selectPackage(pkg: string): void {
      this.selectedPackage = pkg;
  }

  submitBooking(event: Event): void {
      event.preventDefault();
      if (!this.selectedPackage || !this.customerName || !this.phone) {
          alert("Please fill out all required fields and select a package.");
          return;
      }

      this.isSubmitting = true;
      const payload = {
          customerName: this.customerName,
          phone: this.phone,
          servicePackage: this.selectedPackage,
          latitude: this.selectedLat,
          longitude: this.selectedLng
      };

      this.http.post('/api/bookings', payload).subscribe({
          next: () => {
              this.isSubmitting = false;
              this.submitSuccess = true;
          },
          error: (err) => {
              console.error(err);
              alert("Failed to submit booking.");
              this.isSubmitting = false;
          }
      });
  }
}
