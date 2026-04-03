import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-calendar',
  templateUrl: './calendar.html',
  standalone: false
})
export class AdminCalendar implements OnInit {
  public calendarEvents: any[] = [];
  public calendarDays: any[] = [];
  public currentCalendarDate: Date = new Date();

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchCalendarData();
  }

  fetchCalendarData(): void {
    const start = new Date(this.currentCalendarDate.getFullYear(), this.currentCalendarDate.getMonth(), 1);
    const end = new Date(this.currentCalendarDate.getFullYear(), this.currentCalendarDate.getMonth() + 1, 1);
    
    this.http.get<any[]>(`/api/bookings/calendar?start=${start.toISOString()}&end=${end.toISOString()}`).subscribe(data => {
      this.calendarEvents = data;
      this.generateCalendar();
    });
  }

  generateCalendar(): void {
    const year = this.currentCalendarDate.getFullYear();
    const month = this.currentCalendarDate.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Padding
    for(let i=0; i<firstDay; i++) days.push({ day: null, events: [] });
    // Actual days
    const eventsToFilter = this.calendarEvents || [];
    for(let i=1; i<=daysInMonth; i++) {
        // Use a consistent date string by normalizing time to midnight
        const d = new Date(year, month, i);
        const dateStr = d.toDateString();
        
        const events = eventsToFilter.filter(e => {
            if (!e || !e.scheduledStart) return false;
            // Support both ISO strings and Date objects
            const evDate = new Date(e.scheduledStart);
            return evDate.toDateString() === dateStr;
        });
        
        days.push({ day: i, events });
    }
    this.calendarDays = days;
    this.cdr.detectChanges();
  }

  changeMonth(delta: number): void {
    this.currentCalendarDate = new Date(this.currentCalendarDate.getFullYear(), this.currentCalendarDate.getMonth() + delta, 1);
    this.fetchCalendarData();
  }
}
