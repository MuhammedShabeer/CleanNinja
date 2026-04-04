import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-expenses',
  templateUrl: './expenses.html',
  standalone: false
})
export class AdminExpenses implements OnInit {
  public expenses: any[] = [];
  public newExpense: any = { description: '', amount: 0, category: 'General', date: new Date().toISOString().slice(0,10), notes: '' };
  public categories = ['General', 'Supplies', 'Transport', 'Staff', 'Rent', 'Utilities', 'Marketing', 'Maintenance'];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchExpenses();
  }

  fetchExpenses(): void {
    this.http.get<any[]>('/api/revenue/expenses').subscribe(data => {
      this.expenses = data;
      this.cdr.detectChanges();
    });
  }

  addExpense(): void {
    if (!this.newExpense.description.trim() || !this.newExpense.amount) {
      alert('Description and amount are required.');
      return;
    }
    this.http.post('/api/revenue/expenses', this.newExpense).subscribe(() => {
      this.newExpense = { description: '', amount: 0, category: 'General', date: new Date().toISOString().slice(0,10), notes: '' };
      this.fetchExpenses();
    });
  }

  deleteExpense(id: number): void {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    this.http.delete(`/api/revenue/expenses/${id}`).subscribe(() => {
      this.fetchExpenses();
    });
  }
}
