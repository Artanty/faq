import { NgModule } from '@angular/core';
import { NoPreloading, RouterModule, Routes } from '@angular/router';
import { TicketDetailComponent } from './faq/components/ticket-detail/ticket-detail.component';
import { TicketListComponent } from './faq/components/ticket-list/ticket-list.component';
import { FaqComponent } from './faq/faq.component';
import { AppComponent } from './app.component';

const routes: Routes = [
  // { path: '', redirectTo: '/faq', pathMatch: 'full' },
  // { path: 'faq', component: FaqComponent }
  { 
    path: 'faq',
    loadChildren: () => import('./faq/faq.module').then(m => m.FaqModule)
  },
]

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: NoPreloading })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
