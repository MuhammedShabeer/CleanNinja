import { HttpClientModule } from '@angular/common/http';
import { NgModule, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { ServiceWorkerModule } from '@angular/service-worker';
import { Landing } from './pages/landing/landing';
import { Booking } from './pages/booking/booking';
import { Admin } from './pages/admin/admin';

@NgModule({
  declarations: [App, Landing, Booking, Admin],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,

    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}
