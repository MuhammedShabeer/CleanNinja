import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-employees',
  templateUrl: './employees.html',
  standalone: false
})
export class AdminEmployees implements OnInit {
  public employees: any[] = [];
  public newEmployee: any = { name: '', phone: '', role: '', isActive: true };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchEmployees();
  }

  fetchEmployees(): void {
    this.http.get<any[]>('/api/employees').subscribe(data => {
      this.employees = Array.from(new Map(data.map(item => [item['id'], item])).values());
      this.cdr.detectChanges();
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
}
