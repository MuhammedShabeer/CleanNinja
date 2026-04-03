import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-schedules',
  templateUrl: './schedules.html',
  standalone: false
})
export class AdminSchedules implements OnInit {
  public schedules: any[] = [];
  public newSchedule: any = { title: '', customerName: '', phone: '', servicePackage: '', scheduledDate: '', notes: '' };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchSchedules();
  }

  fetchSchedules(): void {
    this.http.get<any[]>('/api/bookings/schedules').subscribe(data => {
      this.schedules = data;
      this.cdr.detectChanges();
    });
  }

  addSchedule(): void {
    if (!this.newSchedule.title.trim() || !this.newSchedule.scheduledDate) { alert('Title and date are required.'); return; }
    const payload = {
      customerName: this.newSchedule.customerName || this.newSchedule.title,
      phone: this.newSchedule.phone || '',
      servicePackage: this.newSchedule.servicePackage || 'General',
      address: this.newSchedule.address || '',
      notes: this.newSchedule.notes || '',
      scheduledDate: this.newSchedule.scheduledDate
    };
    this.http.post('/api/bookings/schedule', payload).subscribe(() => {
      this.newSchedule = { title: '', customerName: '', phone: '', servicePackage: '', scheduledDate: '', notes: '' };
      this.fetchSchedules();
    });
  }

  completeSchedule(id: number): void {
    this.http.put(`/api/bookings/${id}/schedule-complete`, {}).subscribe(() => this.fetchSchedules());
  }

  deleteSchedule(id: number): void {
    if (!confirm('Delete this schedule?')) return;
    this.http.delete(`/api/bookings/${id}`).subscribe(() => this.fetchSchedules());
  }
}
