import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceApiService, CleanService } from '../../services/service-api.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.html',
  styleUrls: ['./booking.css'],
  standalone: false
})
export class Booking implements OnInit {
  public services: CleanService[] = [];
  public selectedService: CleanService | null = null;
  public customerName: string = '';
  public phone: string = '';
  public address: string = '';
  public selectedFrequency: string = 'Once'; // Default value

  public isSubmitting: boolean = false;
  public submitSuccess: boolean = false;

  constructor(
    private serviceApi: ServiceApiService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  get totalPrice(): number {
    if (!this.selectedService) return 0;
    const basePrice = this.selectedService.discountedPrice ?? this.selectedService.price ?? 0;
    
    switch (this.selectedFrequency) {
      case 'Every 2 Days': 
        return this.selectedService.monthlyPrice ?? (basePrice * 15); // Fallback to approx 15 visits
      case 'Weekly': 
        return this.selectedService.weeklyPrice ?? (basePrice * 4); // Fallback to 4 visits
      case 'Monthly': 
        return this.selectedService.monthlyPrice ?? basePrice;
      case 'Yearly': 
        return this.selectedService.yearlyPrice ?? basePrice;
      default: return basePrice;
    }
  }

  ngOnInit(): void {
    this.serviceApi.getServices().subscribe(s => {
      this.services = s;
      this.cdr.detectChanges();
    });
  }

  selectService(s: CleanService): void {
    this.selectedService = s;
  }

  submitBooking(event: Event): void {
    event.preventDefault();
    if (!this.selectedService || !this.customerName || !this.phone) {
      alert('Please fill out all fields and select a service.');
      return;
    }

    this.isSubmitting = true;
    const payload = {
      customerName: this.customerName,
      phone: this.phone,
      servicePackage: `${this.selectedService.name} (${this.selectedFrequency})`,
      address: this.address,
      frequency: this.selectedFrequency,
      latitude: 0,
      longitude: 0
    };

    this.http.post('/api/bookings', payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitSuccess = true;
      },
      error: (err) => {
        console.error(err);
        alert('Failed to submit booking. Please try again.');
        this.isSubmitting = false;
      }
    });
  }
}
