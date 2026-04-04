import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-revenue',
  templateUrl: './revenue.html',
  standalone: false
})
export class AdminRevenue implements OnInit {
  public revenueSummary: any = { totalEarned: 0, totalExpenses: 0, netProfit: 0, pendingCount: 0, completedCount: 0, works: [] };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchRevenueSummary();
  }

  fetchRevenueSummary(): void {
    this.http.get<any>('/api/revenue/summary').subscribe(data => {
      this.revenueSummary = data;
      this.cdr.detectChanges();
    });
  }
}
