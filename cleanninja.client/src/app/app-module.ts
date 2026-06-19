import { HttpClientModule } from '@angular/common/http';
import { NgModule, provideBrowserGlobalErrorListeners, isDevMode, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  SidebarModule,
  HeaderModule,
  NavModule,
  GridModule,
  CardModule,
  TableModule,
  ButtonModule,
  FormModule,
  DropdownModule,
  ModalModule,
  BadgeModule
} from '@coreui/angular';
import { IconModule, IconSetService } from '@coreui/icons-angular';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { ServiceWorkerModule } from '@angular/service-worker';
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
import { BlogList } from './pages/blog/blog-list/blog-list';
import { BlogDetail } from './pages/blog/blog-detail/blog-detail';
import { GalleryPage } from './pages/gallery/gallery';
import { FooterComponent } from './components/footer/footer';

@NgModule({
  declarations: [
    App, Landing, Booking, Admin, Login,
    AdminDashboard, AdminBookings, AdminWorks, AdminSchedules, AdminCalendar,
    AdminRevenue, AdminEmployees, AdminServices, AdminGallery, AdminContent,
    AdminUsers, AdminExpenses, AdminReviews, AdminBlogs,
    BlogList, BlogDetail, GalleryPage, FooterComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SidebarModule,
    HeaderModule,
    NavModule,
    GridModule,
    CardModule,
    TableModule,
    ButtonModule,
    FormModule,
    DropdownModule,
    ModalModule,
    IconModule,
    BadgeModule,

    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    IconSetService
  ],
  bootstrap: [App],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
