import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-users',
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
  standalone: false
})
export class AdminUsers implements OnInit {
  users: any[] = [];
  showModal = false;
  isEdit = false;
  
  currentUser: any = {
    id: 0,
    name: '',
    email: '',
    password: '',
    allowedMenus: 'all'
  };

  availableMenus = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'bookings', name: 'Bookings' },
    { id: 'works', name: 'Works' },
    { id: 'schedules', name: 'Schedules' },
    { id: 'calendar', name: 'Calendar' },
    { id: 'revenue', name: 'Revenue' },
    { id: 'expenses', name: 'Expenses' },
    { id: 'employees', name: 'Employees' },
    { id: 'services', name: 'Services' },
    { id: 'gallery', name: 'Gallery' },
    { id: 'content', name: 'Content' },
    { id: 'users', name: 'Admin Users' }
  ];

  selectedMenus: { [key: string]: boolean } = {};

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.http.get<any[]>('/api/adminusers').subscribe({
      next: (data) => {
        this.users = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching users:', err)
    });
  }

  openAddModal(): void {
    this.isEdit = false;
    this.currentUser = { id: 0, name: '', email: '', password: '', allowedMenus: 'all' };
    this.resetCheckboxes(true);
    this.showModal = true;
  }

  openEditModal(user: any): void {
    this.isEdit = true;
    this.currentUser = { ...user, password: '' };
    this.parseAllowedMenus(user.allowedMenus);
    this.showModal = true;
  }

  resetCheckboxes(all: boolean): void {
    this.availableMenus.forEach(m => {
      this.selectedMenus[m.id] = all;
    });
  }

  parseAllowedMenus(menus: string): void {
    this.resetCheckboxes(menus === 'all');
    if (menus !== 'all') {
      const list = menus.split(',').map(m => m.trim().toLowerCase());
      list.forEach(m => {
        if (this.selectedMenus.hasOwnProperty(m)) {
          this.selectedMenus[m] = true;
        }
      });
    }
  }

  saveUser(): void {
    // Compile allowed menus string
    const selectedKeys = Object.keys(this.selectedMenus).filter(k => this.selectedMenus[k]);
    this.currentUser.allowedMenus = selectedKeys.length === this.availableMenus.length ? 'all' : selectedKeys.join(',');

    if (this.isEdit) {
      this.http.put(`/api/adminusers/${this.currentUser.id}`, this.currentUser).subscribe(() => {
        this.fetchUsers();
        this.showModal = false;
      });
    } else {
      this.http.post('/api/adminusers', this.currentUser).subscribe(() => {
        this.fetchUsers();
        this.showModal = false;
      });
    }
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this administrator?')) {
      this.http.delete(`/api/adminusers/${id}`).subscribe(() => {
        this.fetchUsers();
      });
    }
  }
}
