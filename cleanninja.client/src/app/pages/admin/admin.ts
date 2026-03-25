import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ContentService, SiteContent } from '../../services/content.service';
import { AuthService } from '../../services/auth.service';
import { ServiceApiService, CleanService, ServiceFeedback, GalleryImage } from '../../services/service-api.service';
import { Router } from '@angular/router';
import { IconSetService } from '@coreui/icons-angular';
import { cilList, cilPeople, cilSettings, cilImage, cilAccountLogout, cilMenu, cilPlus, cilTrash, cilSave, cilStar, cilCheckCircle, cilInfo, cilSpeedometer, cilBriefcase, cilCalendar, cilDollar, cilTask } from '@coreui/icons';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  standalone: false
})
export class Admin implements OnInit {
  public activeTab: 'dashboard' | 'bookings' | 'employees' | 'services' | 'content' | 'gallery' | 'works' | 'schedules' | 'revenue' = 'dashboard';
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

  // Works
  public works: any[] = [];
  public newWork: any = { customerName: '', phone: '', servicePackage: '', address: '', revenue: 0 };
  public completingWork: any = null;
  public completeRevenue: number = 0;
  public completeNotes: string = '';

  // Schedules
  public schedules: any[] = [];
  public newSchedule: any = { title: '', customerName: '', phone: '', servicePackage: '', scheduledDate: '', notes: '' };

  // Revenue
  public revenueSummary: any = { totalEarned: 0, totalExpenses: 0, netProfit: 0, pendingCount: 0, completedCount: 0, works: [] };
  public expenses: any[] = [];
  public newExpense: any = { description: '', amount: 0, category: 'General', date: new Date().toISOString().slice(0,10), notes: '' };


  constructor(
    private http: HttpClient,
    private contentService: ContentService,
    private authService: AuthService,
    private serviceApi: ServiceApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public iconSet: IconSetService
  ) {
    this.iconSet.icons = { cilList, cilPeople, cilSettings, cilImage, cilAccountLogout, cilMenu, cilPlus, cilTrash, cilSave, cilStar, cilCheckCircle, cilInfo, cilSpeedometer, cilBriefcase, cilCalendar, cilDollar, cilTask };
  }

  ngOnInit(): void {
    this.adminName = this.authService.getAdminName();
    this.fetchBookings();
    this.fetchEmployees();
    this.fetchServices();
    this.fetchGallery();
    this.fetchWorks();
    this.fetchSchedules();
    this.fetchRevenueSummary();
    
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


  switchTab(tab: 'dashboard' | 'bookings' | 'employees' | 'services' | 'gallery' | 'content' | 'works' | 'schedules' | 'revenue'): void {
    this.activeTab = tab;
    if (tab === 'revenue') { this.fetchRevenueSummary(); this.fetchExpenses(); }
    if (tab === 'works') this.fetchWorks();
    if (tab === 'schedules') this.fetchSchedules();
    if (tab === 'dashboard') this.fetchRevenueSummary();
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

  // ── Works ──────────────────────────────────────────
  fetchWorks(): void {
    this.http.get<any[]>('/api/works').subscribe(data => {
      this.works = data;
      this.cdr.detectChanges();
    });
  }

  addWork(): void {
    if (!this.newWork.customerName.trim()) { alert('Customer name is required.'); return; }
    this.http.post('/api/works', this.newWork).subscribe(() => {
      this.newWork = { customerName: '', phone: '', servicePackage: '', address: '', revenue: 0 };
      this.fetchWorks();
    });
  }

  acceptWork(id: number): void {
    this.http.put(`/api/works/${id}/accept`, {}).subscribe(() => this.fetchWorks());
  }

  createWorkFromBooking(bookingId: number): void {
    this.http.post(`/api/works/from-booking/${bookingId}`, {}).subscribe(() => {
      this.fetchWorks();
      this.fetchBookings();
    });
  }

  assignWorkEmployee(workId: number, employeeId: number): void {
    if (!employeeId) return;
    this.http.put(`/api/works/${workId}/assign/${employeeId}`, {}).subscribe(() => this.fetchWorks());
  }

  openCompleteWork(work: any): void {
    this.completingWork = work;
    this.completeRevenue = work.revenue || 0;
    this.completeNotes = '';
  }

  submitCompleteWork(): void {
    if (!this.completingWork) return;
    this.http.put(`/api/works/${this.completingWork.id}/complete`, { revenue: this.completeRevenue, notes: this.completeNotes }).subscribe(() => {
      this.completingWork = null;
      this.fetchWorks();
      this.fetchRevenueSummary();
    });
  }

  deleteWork(id: number): void {
    if (!confirm('Delete this work?')) return;
    this.http.delete(`/api/works/${id}`).subscribe(() => this.fetchWorks());
  }

  // ── Schedules ──────────────────────────────────────────
  fetchSchedules(): void {
    this.http.get<any[]>('/api/schedules').subscribe(data => {
      this.schedules = data;
      this.cdr.detectChanges();
    });
  }

  addSchedule(): void {
    if (!this.newSchedule.title.trim() || !this.newSchedule.scheduledDate) { alert('Title and date are required.'); return; }
    this.http.post('/api/schedules', this.newSchedule).subscribe(() => {
      this.newSchedule = { title: '', customerName: '', phone: '', servicePackage: '', scheduledDate: '', notes: '' };
      this.fetchSchedules();
    });
  }

  completeSchedule(id: number): void {
    this.http.put(`/api/schedules/${id}/complete`, {}).subscribe(() => this.fetchSchedules());
  }

  deleteSchedule(id: number): void {
    if (!confirm('Delete this schedule?')) return;
    this.http.delete(`/api/schedules/${id}`).subscribe(() => this.fetchSchedules());
  }

  // ── Revenue ──────────────────────────────────────────
  fetchRevenueSummary(): void {
    this.http.get<any>('/api/revenue/summary').subscribe(data => {
      this.revenueSummary = data;
      this.cdr.detectChanges();
    });
  }

  fetchExpenses(): void {
    this.http.get<any[]>('/api/revenue/expenses').subscribe(data => {
      this.expenses = data;
      this.cdr.detectChanges();
    });
  }

  addExpense(): void {
    if (!this.newExpense.description.trim() || !this.newExpense.amount) { alert('Description and amount are required.'); return; }
    this.http.post('/api/revenue/expenses', this.newExpense).subscribe(() => {
      this.newExpense = { description: '', amount: 0, category: 'General', date: new Date().toISOString().slice(0,10), notes: '' };
      this.fetchExpenses();
      this.fetchRevenueSummary();
    });
  }

  deleteExpense(id: number): void {
    if (!confirm('Delete this expense?')) return;
    this.http.delete(`/api/revenue/expenses/${id}`).subscribe(() => {
      this.fetchExpenses();
      this.fetchRevenueSummary();
    });
  }
}

