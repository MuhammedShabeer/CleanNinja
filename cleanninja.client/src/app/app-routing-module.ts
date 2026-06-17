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
import { AdminExpenses } from './pages/admin/expenses/expenses';
import { AdminReviews } from './pages/admin/reviews/reviews';
import { AdminBlogs } from './pages/admin/blogs/blogs';
import { Login } from './pages/login/login';
import { AuthGuard } from './guards/auth.guard';
import { BlogList } from './pages/blog/blog-list/blog-list';
import { BlogDetail } from './pages/blog/blog-detail/blog-detail';
import { GalleryPage } from './pages/gallery/gallery';

const routes: Routes = [
  { path: '', component: Landing },
  { path: 'booking', component: Booking },
  { path: 'blogs', component: BlogList },
  { path: 'blogs/:id', component: BlogDetail },
  { path: 'gallery', component: GalleryPage },
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
      { path: 'expenses', component: AdminExpenses },
      { path: 'employees', component: AdminEmployees },
      { path: 'services', component: AdminServices },
      { path: 'gallery', component: AdminGallery },
      { path: 'content', component: AdminContent },
      { path: 'reviews', component: AdminReviews },
      { path: 'blogs', component: AdminBlogs },
      { path: 'users', component: AdminUsers }
    ]
  },
  { path: 'admin/login', component: Login },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
