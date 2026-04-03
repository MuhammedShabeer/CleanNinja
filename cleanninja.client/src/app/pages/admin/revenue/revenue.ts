import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-revenue',
  templateUrl: './revenue.html',
  standalone: false
})
export class AdminRevenue implements OnInit {
  public revenueSummary: any = { totalEarned: 0, totalExpenses: 0, netProfit: 0, pendingCount: 0, completedCount: 0, works: [] };
  public expenses: any[] = [];
  public newExpense: any = { description: '', amount: 0, category: 'General', date: new Date().toISOString().slice(0,10), notes: '' };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchRevenueSummary();
    this.fetchExpenses();
  }

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
