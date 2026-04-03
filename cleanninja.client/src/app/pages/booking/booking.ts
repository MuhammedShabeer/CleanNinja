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
  public selectedFrequency: string = 'Once';
  public frequencyCount: number = 2; // must be > 1 for recurring
  public scheduledDate: string = '';
  public availableSlots: string[] = [];
  public selectedSlot: string | null = null;
  public isLoadingSlots: boolean = false;

  public isSubmitting: boolean = false;
  public submitSuccess: boolean = false;
  public backendUrl: string = ''; // Relative path by default

  constructor(
    private serviceApi: ServiceApiService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  get frequencyLabel(): string {
    switch (this.selectedFrequency) {
      case 'Every 2 Days': return `sessions (every 2 days)`;
      case 'Weekly': return `weeks`;
      case 'Monthly': return `months`;
      case 'Yearly': return `years`;
      default: return '';
    }
  }

  get totalPrice(): number {
    if (!this.selectedService) return 0;
    const basePrice = this.selectedService.discountedPrice ?? this.selectedService.price ?? 0;
    const count = (this.selectedFrequency !== 'Once' && this.frequencyCount > 1) ? this.frequencyCount : 1;

    switch (this.selectedFrequency) {
      case 'Every 2 Days':
        // Each session = single visit price; count = number of sessions
        return (this.selectedService.discountedPrice ?? this.selectedService.price ?? 0) * count;
      case 'Weekly':
        return (this.selectedService.weeklyPrice ?? (basePrice * 4)) * count;
      case 'Monthly':
        return (this.selectedService.monthlyPrice ?? basePrice) * count;
      case 'Yearly':
        return (this.selectedService.yearlyPrice ?? basePrice) * count;
      default:
        return basePrice;
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
    if (this.scheduledDate) this.fetchAvailableSlots();
  }

  onDateChange(): void {
    this.fetchAvailableSlots();
  }

  fetchAvailableSlots(): void {
    if (!this.selectedService || !this.scheduledDate) return;
    this.isLoadingSlots = true;
    this.selectedSlot = null;
    this.http.get<string[]>(`/api/bookings/available-slots?serviceId=${this.selectedService.id}&date=${this.scheduledDate}`)
      .subscribe({
        next: (slots) => {
          this.availableSlots = slots;
          this.isLoadingSlots = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoadingSlots = false;
          this.cdr.detectChanges();
        }
      });
  }

  selectSlot(slot: string): void {
    this.selectedSlot = slot;
  }

  submitBooking(event: Event): void {
    event.preventDefault();
    if (!this.selectedService || !this.customerName || !this.phone) {
      alert('Please fill out all fields and select a service.');
      return;
    }

    if (this.selectedFrequency !== 'Once' && (this.frequencyCount < 2)) {
      alert('Frequency count must be greater than 1.');
      return;
    }

    this.isSubmitting = true;
    const payload: any = {
      customerName: this.customerName,
      phone: this.phone,
      servicePackage: `${this.selectedService.name} (${this.selectedFrequency}${this.selectedFrequency !== 'Once' ? ' x' + this.frequencyCount : ''})`,
      address: this.address,
      frequency: this.selectedFrequency,
      frequencyCount: this.selectedFrequency !== 'Once' ? this.frequencyCount : 1,
      latitude: 0,
      longitude: 0
    };
    if (this.scheduledDate && this.selectedSlot) {
      // Create a full DateTime from date and slot
      // Slot is ISO string from server
      payload.scheduledDate = this.selectedSlot;
    }

    this.http.post('/api/bookings', payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to submit booking. Please try again.');
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  getMediaUrl(url: string | undefined): string {
    if (!url) return 'assets/images/service_placeholder.png';
    if (url.startsWith('http')) return url;
    return `${this.backendUrl}${url}`;
  }
}
