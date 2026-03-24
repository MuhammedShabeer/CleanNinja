import { HttpClientModule } from '@angular/common/http';
import { NgModule, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
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
  ModalModule
} from '@coreui/angular';
import { IconModule, IconSetService } from '@coreui/icons-angular';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { ServiceWorkerModule } from '@angular/service-worker';
import { Landing } from './pages/landing/landing';
import { Booking } from './pages/booking/booking';
import { Admin } from './pages/admin/admin';
import { Login } from './pages/login/login';

@NgModule({
  declarations: [App, Landing, Booking, Admin, Login],
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
})
export class AppModule {}
