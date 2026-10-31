import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ServiceApiService, CleanService } from '../../services/service-api.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.html',
  styleUrls: ['./booking.css'],
  standalone: false
})
export class Booking implements OnInit {
  public services: CleanService[] = [];
  public categories: string[] = [];
  public selectedCategory: string = 'All';
  public selectedService: CleanService | null = null;
  public customerName: string = '';
  public customerEmail: string = '';
  public phone: string = '';
  public address: string = '';
  public zipcode: string = '';
  public selectedFrequency: string = 'Once';
  public frequencyCount: number = 2; // must be > 1 for recurring
  public scheduledDate: string = '';
  public availableSlots: any[] = [];
  public selectedSlot: any | null = null;
  public isLoadingSlots: boolean = false;

  public preferredHour: string = '10:00';
  public availableHours: string[] = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  public isSubmitting: boolean = false;
  public submitSuccess: boolean = false;
  public backendUrl: string = ''; // Relative path by default

  constructor(
    private serviceApi: ServiceApiService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private seoService: SeoService
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
    this.seoService.updateSeoTags(
        'Book a Cleaning Service in Liverpool - Clean Ninja',
        'Schedule your premium mobile valeting and cleaning service in Liverpool today.'
    );
    this.serviceApi.getServices().subscribe(s => {
      this.services = s;
      
      // Extract unique categories, ignoring empty/null ones
      const cats = new Set(s.map(svc => svc.category).filter(c => !!c));
      this.categories = Array.from(cats);
      
      // Check query parameters
      this.route.queryParams.subscribe(params => {
        if (params['category']) {
          this.selectedCategory = params['category'];
        }
        if (params['serviceId']) {
          const svcId = Number(params['serviceId']);
          const svc = this.services.find(x => x.id === svcId);
          if (svc) {
            this.selectedCategory = svc.category || 'All';
            this.selectService(svc);
          }
        }
      });
      
      this.cdr.detectChanges();
    });
  }

  get filteredServices(): CleanService[] {
    if (this.selectedCategory === 'All') {
      return this.services;
    }
    return this.services.filter(s => s.category === this.selectedCategory);
  }

  selectCategory(cat: string): void {
    this.selectedCategory = cat;
  }

  selectService(s: CleanService): void {
    this.selectedService = s;
    if (this.scheduledDate) this.fetchAvailableSlots();
  }

  onDateChange(): void {
    this.fetchAvailableSlots();
  }

  fetchAvailableSlots(): void {
    if (!this.selectedService || !this.scheduledDate || !this.selectedService.isSlotBased) return;
    this.isLoadingSlots = true;
    this.selectedSlot = null;
    this.http.get<any[]>(`/api/bookings/available-slots?serviceId=${this.selectedService.id}&date=${this.scheduledDate}`)
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

  selectSlot(slot: any): void {
    this.selectedSlot = slot;
  }

  submitBooking(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    alert("We are not taking bookings right now. We will start taking bookings soon!");
    return;
  }

  getMediaUrl(url: string | undefined): string {
    if (!url) return 'assets/images/service_placeholder.png';
    if (url.startsWith('http')) return url;
    return `${this.backendUrl}${url}`;
  }
}
