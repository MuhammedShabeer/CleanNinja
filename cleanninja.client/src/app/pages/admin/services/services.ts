import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ServiceApiService, CleanService, ServiceFeedback } from '../../../services/service-api.service';

@Component({
  selector: 'app-admin-services',
  templateUrl: './services.html',
  standalone: false
})
export class AdminServices implements OnInit {
  public services: CleanService[] = [];
  public newService: any = { name: '', description: '', icon: '<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="..."/></svg>', sortOrder: 0, isActive: true };
  public editingService: CleanService | null = null;
  public isUploadingMedia: { [key: number]: boolean } = {};
  public loadedFeedbacks: { [serviceId: number]: ServiceFeedback[] } = {};

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
    this.serviceApi.createService(this.newService).subscribe(() => {
      this.newService = { name: '', description: '', icon: '<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="..."/></svg>', sortOrder: 0, isActive: true };
      this.fetchServices();
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

  deleteMedia(serviceId: number, mediaId: number): void {
    if (!confirm('Delete this media?')) return;
    this.serviceApi.deleteMedia(serviceId, mediaId).subscribe(() => this.fetchServices());
  }

  loadFeedback(serviceId: number): void {
    this.serviceApi.getFeedback(serviceId).subscribe(data => {
      this.loadedFeedbacks[serviceId] = data;
      this.cdr.detectChanges();
    });
  }

  approveFeedback(feedbackId: number, serviceId: number): void {
    this.serviceApi.approveFeedback(feedbackId).subscribe(() => this.loadFeedback(serviceId));
  }

  deleteFeedback(feedbackId: number, serviceId: number): void {
    if (!confirm('Delete this review?')) return;
    this.serviceApi.deleteFeedback(feedbackId).subscribe(() => this.loadFeedback(serviceId));
  }

  toggleHighlight(s: CleanService): void {
    s.isHighlighted = !s.isHighlighted;
    this.serviceApi.updateService(s.id, s).subscribe(() => this.fetchServices());
  }
}
