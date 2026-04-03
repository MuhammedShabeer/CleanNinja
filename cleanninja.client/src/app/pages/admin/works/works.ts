import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-works',
  templateUrl: './works.html',
  standalone: false
})
export class AdminWorks implements OnInit {
  public works: any[] = [];
  public employees: any[] = [];
  
  public completingWork: any = null;
  public completeRevenue: number = 0;
  public completeNotes: string = '';

  public isAssignModalOpen: boolean = false;
  public currentAssignWork: any = null;
  public selectedEmployeeIds: { [bookingId: number]: number[] } = {};

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchWorks();
    this.fetchEmployees();
  }

  fetchWorks(): void {
    this.http.get<any[]>('/api/bookings/all').subscribe(data => {
      this.works = data;
      this.cdr.detectChanges();
    });
  }

  fetchEmployees(): void {
    this.http.get<any[]>('/api/employees').subscribe(data => {
      this.employees = Array.from(new Map(data.map(item => [item['id'], item])).values());
      this.cdr.detectChanges();
    });
  }

  getAssignedNames(booking: any): string {
    if (!booking || !booking.assignedEmployees || booking.assignedEmployees.length === 0) return '';
    return booking.assignedEmployees.map((e: any) => e.name).join(', ');
  }

  acceptWork(id: number): void {
    this.http.put(`/api/bookings/${id}/accept`, {}).subscribe(() => this.fetchWorks());
  }

  openAssignModal(work: any): void {
    this.currentAssignWork = work;
    this.isAssignModalOpen = true;
    this.selectedEmployeeIds[work.id] = (work.assignedEmployees || []).map((e: any) => e.id);
    this.cdr.detectChanges();
  }

  closeAssignModal(): void {
    this.isAssignModalOpen = false;
    this.currentAssignWork = null;
  }

  saveAssignment(): void {
    if (!this.currentAssignWork) return;
    const workId = this.currentAssignWork.id;
    const employeeIds = this.selectedEmployeeIds[workId] || [];
    
    this.http.put(`/api/bookings/${workId}/assign`, employeeIds).subscribe({
      next: () => {
        this.fetchWorks();
        this.closeAssignModal();
      },
      error: (err) => alert('Assignment error: ' + (err.error?.detail || err.message))
    });
  }

  isEmployeeAssigned(booking: any, employeeId: number): boolean {
    if (!booking || !booking.assignedEmployees) return false;
    return booking.assignedEmployees.some((e: any) => e.id === employeeId);
  }

  toggleEmployeeAssignment(bookingId: number | undefined, employeeId: number, currentAssigned: any[] | undefined): void {
     if (bookingId === undefined) return;
     if (!this.selectedEmployeeIds[bookingId]) {
        this.selectedEmployeeIds[bookingId] = (currentAssigned || []).map(e => e.id);
     }
     const index = this.selectedEmployeeIds[bookingId].indexOf(employeeId);
     if (index > -1) {
       this.selectedEmployeeIds[bookingId].splice(index, 1);
     } else {
       this.selectedEmployeeIds[bookingId].push(employeeId);
     }
  }

  trackByEmployeeId(index: number, employee: any): number {
    return employee.id;
  }

  openCompleteWork(work: any): void {
    this.completingWork = work;
    this.completeRevenue = work.revenue || 0;
    this.completeNotes = '';
  }

  submitCompleteWork(): void {
    if (!this.completingWork) return;
    this.http.put(`/api/bookings/${this.completingWork.id}/complete`, { revenue: this.completeRevenue, notes: this.completeNotes }).subscribe(() => {
      this.completingWork = null;
      this.fetchWorks();
    });
  }

  deleteWork(id: number): void {
    if (!confirm('Delete this work?')) return;
    this.http.delete(`/api/bookings/${id}`).subscribe(() => this.fetchWorks());
  }
}
