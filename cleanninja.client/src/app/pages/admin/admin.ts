import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ContentService, SiteContent } from '../../services/content.service';
import { AuthService } from '../../services/auth.service';
import { ServiceApiService, CleanService, ServiceFeedback, GalleryImage } from '../../services/service-api.service';
import { Router } from '@angular/router';
import { IconSetService } from '@coreui/icons-angular';
import { cilList, cilPeople, cilSettings, cilImage, cilAccountLogout, cilMenu, cilPlus, cilTrash, cilSave, cilStar, cilCheckCircle, cilInfo } from '@coreui/icons';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  standalone: false
})
export class Admin implements OnInit {
  public activeTab: 'bookings' | 'employees' | 'services' | 'content' | 'gallery' = 'bookings';
  public sidebarVisible: boolean = true;
  public pendingBookings: any[] = [];
  public previousBookings: any[] = [];
  public employees: any[] = [];
  public contentItems: SiteContent[] = [];
  public whatsAppContact: string = '+447578334674';
  public adminName: string = '';

  // New employee form
  public newEmployee: any = { name: '', phone: '', role: '', isActive: true };

  // Services management
  public services: CleanService[] = [];
  public newService: any = { name: '', description: '', icon: '<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="..."/></svg>', sortOrder: 0, isActive: true };
  public editingService: CleanService | null = null;
  public isUploadingMedia: { [key: number]: boolean } = {};
  public loadedFeedbacks: { [serviceId: number]: ServiceFeedback[] } = {};

  // Gallery
  public galleryImages: GalleryImage[] = [];
  public isUploadingGallery: boolean = false;


  constructor(
    private http: HttpClient,
    private contentService: ContentService,
    private authService: AuthService,
    private serviceApi: ServiceApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public iconSet: IconSetService
  ) {
    this.iconSet.icons = { cilList, cilPeople, cilSettings, cilImage, cilAccountLogout, cilMenu, cilPlus, cilTrash, cilSave, cilStar, cilCheckCircle, cilInfo };
  }

  ngOnInit(): void {
    this.adminName = this.authService.getAdminName();
    this.fetchBookings();
    this.fetchEmployees();
    this.fetchServices();
    this.fetchGallery();
    
    // Explicitly refresh content to ensure it's loaded in Admin
    this.contentService.refreshContent().subscribe(items => {
      // Filter out old Service-related keys
      const excludedKeys = ['Services', 'SilverPackagePrice', 'SilverPackageFeatures', 'GoldPackagePrice', 'GoldPackageFeatures'];
      this.contentItems = JSON.parse(JSON.stringify(items)).filter((item: any) => !excludedKeys.includes(item.key));
      
      const waItem = this.contentItems.find(c => c.key === 'WhatsAppContact');
      if (waItem) this.whatsAppContact = waItem.value;
      this.cdr.detectChanges();
    });
  }


  switchTab(tab: 'bookings' | 'employees' | 'services' | 'gallery' | 'content'): void {
    this.activeTab = tab;
  }

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Authorization': `Bearer ${this.authService.getToken()}` });
  }


  fetchBookings(): void {
    this.http.get<any[]>('/api/bookings/all').subscribe(data => {
      this.pendingBookings = data.filter(b => b.status === 'Pending');
      this.previousBookings = data.filter(b => b.status !== 'Pending');
      this.cdr.detectChanges();
    });
  }

  fetchEmployees(): void {
    this.http.get<any[]>('/api/employees').subscribe(data => {
      this.employees = data;
      this.cdr.detectChanges();
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
      this.newEmployee = { name: '', phone: '', role: '', isActive: true };
      this.fetchEmployees();
    });
  }

  removeEmployee(id: number): void {
    if (!confirm('Remove this employee?')) return;
    this.http.delete(`/api/employees/${id}`).subscribe(() => this.fetchEmployees());
  }
  
  toggleEmployeeActive(employee: any): void {
      const updated = { ...employee, isActive: !employee.isActive };
      this.http.put(`/api/employees/${employee.id}`, updated).subscribe(() => this.fetchEmployees());
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

  // ── Gallery ──────────────────────────────────────────
  fetchGallery(): void {
    this.serviceApi.getGallery().subscribe(data => {
      this.galleryImages = data;
      this.cdr.detectChanges();
    });
  }

  onGalleryFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isUploadingGallery = true;
    this.serviceApi.uploadGalleryImage(file).subscribe({
      next: () => {
        this.isUploadingGallery = false;
        this.fetchGallery();
      },
      error: () => {
        this.isUploadingGallery = false;
        alert('Upload failed.');
      }
    });
    input.value = '';
  }

  deleteGalleryImage(id: number): void {
    if (!confirm('Delete this gallery image?')) return;
    this.serviceApi.deleteGalleryImage(id).subscribe(() => this.fetchGallery());
  }
}

