import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ContentService, SiteContent } from '../../services/content.service';
import { AuthService } from '../../services/auth.service';
import { ServiceApiService, CleanService, ServiceFeedback } from '../../services/service-api.service';
import { Router } from '@angular/router';
import * as L from 'leaflet';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  standalone: false
})
export class Admin implements OnInit, AfterViewInit {
  public activeTab: 'bookings' | 'employees' | 'services' | 'content' = 'bookings';
  public pendingBookings: any[] = [];
  public employees: any[] = [];
  public contentItems: SiteContent[] = [];
  public whatsAppContact: string = '+447578334674';
  public adminName: string = '';

  // New employee form
  public newEmployee = { name: '', phone: '', role: '' };

  // Services management
  public services: CleanService[] = [];
  public newService = { name: '', description: '', icon: '🔧', sortOrder: 0 };
  public editingService: CleanService | null = null;
  public isUploadingMedia: { [key: number]: boolean } = {};
  public loadedFeedbacks: { [serviceId: number]: ServiceFeedback[] } = {};

  private map: any;
  private markers: L.Marker[] = [];

  constructor(
    private http: HttpClient,
    private contentService: ContentService,
    private authService: AuthService,
    private serviceApi: ServiceApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.adminName = this.authService.getAdminName();
    this.fetchBookings();
    this.fetchEmployees();
    this.fetchServices();
    this.contentService.getContent().subscribe(items => {
      this.contentItems = JSON.parse(JSON.stringify(items));
      const waItem = this.contentItems.find(c => c.key === 'WhatsAppContact');
      if (waItem) this.whatsAppContact = waItem.value;
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  switchTab(tab: 'bookings' | 'employees' | 'content'): void {
    this.activeTab = tab;
    if (tab === 'bookings') {
      setTimeout(() => { this.map.invalidateSize(); }, 100);
    }
  }

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Authorization': `Bearer ${this.authService.getToken()}` });
  }

  private initMap(): void {
    const iconDefault = L.icon({
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      iconUrl: 'assets/marker-icon.png',
      shadowUrl: 'assets/marker-shadow.png',
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], tooltipAnchor: [16, -28], shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;
    this.map = L.map('admin-map').setView([53.4084, -2.9916], 12);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(this.map);
  }

  fetchBookings(): void {
    this.http.get<any[]>('/api/bookings/pending').subscribe(data => {
      this.pendingBookings = data;
      this.updateMapMarkers();
    });
  }

  fetchEmployees(): void {
    this.http.get<any[]>('/api/employees').subscribe(data => {
      this.employees = data;
    });
  }

  updateMapMarkers(): void {
    if (!this.map) return;
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];
    this.pendingBookings.forEach(b => {
      const marker = L.marker([b.latitude, b.longitude]).addTo(this.map)
        .bindPopup(`<b>${b.customerName}</b><br>${b.servicePackage}<br>${b.phone}${b.assignedEmployeeName ? '<br>👷 ' + b.assignedEmployeeName : ''}`);
      this.markers.push(marker);
    });
  }

  approveBooking(id: number, phone: string, name: string, packageType: string): void {
    this.http.put(`/api/bookings/${id}/approve`, {}).subscribe(() => {
      const waLink = `https://wa.me/${this.whatsAppContact.replace('+', '')}?text=Hi%20${encodeURIComponent(name)},%20your%20${encodeURIComponent(packageType)}%20booking%20is%20approved!`;
      window.open(waLink, '_blank');
      this.fetchBookings();
    });
  }

  assignEmployee(bookingId: number, employeeId: number): void {
    if (!employeeId) return;
    this.http.put(`/api/bookings/${bookingId}/assign/${employeeId}`, {}).subscribe(() => {
      this.fetchBookings();
    });
  }

  addEmployee(): void {
    if (!this.newEmployee.name || !this.newEmployee.phone || !this.newEmployee.role) {
      alert('Please fill all employee fields.'); return;
    }
    this.http.post('/api/employees', this.newEmployee).subscribe(() => {
      this.newEmployee = { name: '', phone: '', role: '' };
      this.fetchEmployees();
    });
  }

  removeEmployee(id: number): void {
    if (!confirm('Remove this employee?')) return;
    this.http.delete(`/api/employees/${id}`).subscribe(() => this.fetchEmployees());
  }

  saveContentItem(item: SiteContent): void {
    this.contentService.updateContentItem(item).subscribe(() => {
      alert(`Updated ${item.key} successfully.`);
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }

  // ── Services ──────────────────────────────────────────
  fetchServices(): void {
    this.serviceApi.getServices().subscribe(data => this.services = data);
  }

  addService(): void {
    if (!this.newService.name.trim()) { alert('Service name is required.'); return; }
    this.serviceApi.createService(this.newService).subscribe(() => {
      this.newService = { name: '', description: '', icon: '🔧', sortOrder: 0 };
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

