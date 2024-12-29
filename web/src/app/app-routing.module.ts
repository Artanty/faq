import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketDetailComponent } from './faq/components/ticket-detail/ticket-detail.component';
import { TicketListComponent } from './faq/components/ticket-list/ticket-list.component';
import { FaqComponent } from './faq/faq.component';

const routes: Routes = [
  { path: '', redirectTo: '/faq', pathMatch: 'full' },
  { path: 'faq', component: FaqComponent },
]

// const routes: Routes = [
//   { path: '', component: TicketListComponent },
//   { path: 'ticket/:id', component: TicketDetailComponent },
// ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
