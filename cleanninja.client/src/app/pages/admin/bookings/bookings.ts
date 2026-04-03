import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-bookings',
  templateUrl: './bookings.html',
  standalone: false
})
export class AdminBookings implements OnInit {
  public pendingBookings: any[] = [];
  public previousBookings: any[] = [];
  public employees: any[] = [];
  
  public approvingBooking: any = null;
  public overrideDuration: number = 60;
  
  public isAssignModalOpen: boolean = false;
  public currentAssignWork: any = null;
  public selectedEmployeeIds: { [bookingId: number]: number[] } = {};

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchBookings();
    this.fetchEmployees();
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
      this.employees = Array.from(new Map(data.map(item => [item['id'], item])).values());
      this.cdr.detectChanges();
    });
  }

  getAssignedNames(booking: any): string {
    if (!booking || !booking.assignedEmployees || booking.assignedEmployees.length === 0) return '';
    return booking.assignedEmployees.map((e: any) => e.name).join(', ');
  }

  openApproveModal(booking: any): void {
    this.approvingBooking = booking;
    this.overrideDuration = booking.durationMinutes || 60;
  }

  approveBooking(): void {
    if (!this.approvingBooking) return;
    this.http.put(`/api/bookings/${this.approvingBooking.id}/approve`, { overrideDurationMinutes: this.overrideDuration }).subscribe(() => {
      this.approvingBooking = null;
      this.fetchBookings();
    });
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
        this.fetchBookings();
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
}
