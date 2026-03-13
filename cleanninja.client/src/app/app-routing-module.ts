import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Landing } from './pages/landing/landing';
import { Booking } from './pages/booking/booking';
import { Admin } from './pages/admin/admin';

const routes: Routes = [
  { path: '', component: Landing },
  { path: 'booking', component: Booking },
  { path: 'admin', component: Admin },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
