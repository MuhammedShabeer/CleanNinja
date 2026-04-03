import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Landing } from './pages/landing/landing';
import { Booking } from './pages/booking/booking';
import { Admin } from './pages/admin/admin';
import { AdminDashboard } from './pages/admin/dashboard/dashboard';
import { AdminBookings } from './pages/admin/bookings/bookings';
import { AdminWorks } from './pages/admin/works/works';
import { AdminSchedules } from './pages/admin/schedules/schedules';
import { AdminCalendar } from './pages/admin/calendar/calendar';
import { AdminRevenue } from './pages/admin/revenue/revenue';
import { AdminEmployees } from './pages/admin/employees/employees';
import { AdminServices } from './pages/admin/services/services';
import { AdminGallery } from './pages/admin/gallery/gallery';
import { AdminContent } from './pages/admin/content/content';
import { AdminUsers } from './pages/admin/users/users';
import { Login } from './pages/login/login';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: Landing },
  { path: 'booking', component: Booking },
  { 
    path: 'admin', 
    component: Admin, 
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboard },
      { path: 'bookings', component: AdminBookings },
      { path: 'works', component: AdminWorks },
      { path: 'schedules', component: AdminSchedules },
      { path: 'calendar', component: AdminCalendar },
      { path: 'revenue', component: AdminRevenue },
      { path: 'employees', component: AdminEmployees },
      { path: 'services', component: AdminServices },
      { path: 'gallery', component: AdminGallery },
      { path: 'content', component: AdminContent },
      { path: 'users', component: AdminUsers }
    ]
  },
  { path: 'admin/login', component: Login },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
