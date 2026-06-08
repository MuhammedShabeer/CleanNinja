import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ServiceApiService, CleanService, ServiceFeedback } from '../../../services/service-api.service';

@Component({
  selector: 'app-admin-services',
  templateUrl: './services.html',
  standalone: false
})
export class AdminServices implements OnInit {
  public services: CleanService[] = [];
  public newService: any = { name: '', category: 'Uncategorized', description: '', icon: '<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="..."/></svg>', sortOrder: 0, isActive: true, showInOffersPopup: false, defaultDurationMinutes: 60 };
  public editingService: CleanService | null = null;
  public isUploadingMedia: { [key: number]: boolean } = {};
  public isUploadingFlyer: { [key: number]: boolean } = {};
  constructor(
    private serviceApi: ServiceApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchServices();
  }

  fetchServices(): void {
    this.serviceApi.getServices().subscribe(data => {
      this.services = data;
      this.cdr.detectChanges();
    });
  }

  addService(): void {
    if (!this.newService.name.trim()) { alert('Service name is required.'); return; }
    // Ensure default active state for new services
    this.newService.isActive = true;
    this.serviceApi.createService(this.newService).subscribe({
      next: () => {
        this.newService = { name: '', category: 'Uncategorized', description: '', icon: '<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="..."/></svg>', sortOrder: 0, isActive: true, showInOffersPopup: false, defaultDurationMinutes: 60 };
        this.fetchServices();
      },
      error: (err) => {
        console.error('Error creating service:', err);
        alert('Failed to create service. Please check console for details.');
      }
    });
  }

  saveService(s: CleanService): void {
    this.serviceApi.updateService(s.id, s).subscribe(() => {
      this.editingService = null;
      this.fetchServices();
    });
  }

  deleteService(id: number): void {
    if (!confirm('Delete this service?')) return;
    this.serviceApi.deleteService(id).subscribe(() => this.fetchServices());
  }

  onMediaSelected(event: Event, serviceId: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.isUploadingMedia[serviceId] = true;
    this.serviceApi.uploadMedia(serviceId, file).subscribe({
      next: () => { this.isUploadingMedia[serviceId] = false; this.fetchServices(); },
      error: () => { this.isUploadingMedia[serviceId] = false; alert('Upload failed.'); }
    });
    input.value = '';
  }

  onFlyerSelected(event: Event, service: CleanService): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.isUploadingFlyer[service.id] = true;
    this.serviceApi.uploadOfferFlyer(service.id, file).subscribe({
      next: (res) => { 
        this.isUploadingFlyer[service.id] = false; 
        service.offerFlyerUrl = res.url;
        this.saveService(service);
      },
      error: () => { this.isUploadingFlyer[service.id] = false; alert('Flyer upload failed.'); }
    });
    input.value = '';
  }

  removeFlyer(service: CleanService): void {
    if (!confirm('Remove this offer flyer?')) return;
    service.offerFlyerUrl = undefined;
    this.saveService(service);
  }

  deleteMedia(serviceId: number, mediaId: number): void {
    if (!confirm('Delete this media?')) return;
    this.serviceApi.deleteMedia(serviceId, mediaId).subscribe(() => this.fetchServices());
  }


  toggleHighlight(s: CleanService): void {
    s.isHighlighted = !s.isHighlighted;
    this.serviceApi.updateService(s.id, s).subscribe(() => this.fetchServices());
  }
}
