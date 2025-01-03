import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketDetailComponent } from './faq/components/ticket-detail/ticket-detail.component';
import { TicketListComponent } from './faq/components/ticket-list/ticket-list.component';
import { FaqComponent } from './faq/faq.component';
import { AppComponent } from './app.component';

const routes: Routes = [
  { path: '', redirectTo: '/faq', pathMatch: 'full' },
  { path: 'faq', component: FaqComponent },
  // { path: '', redirectTo: '/faq', pathMatch: 'full' },
  // { path: '', component: FaqComponent },
]

// const routes: Routes = [
//   { path: '', component: AppComponent },
//   // { path: 'ticket/:id', component: TicketDetailComponent },
// ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
