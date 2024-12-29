import { ChangeDetectionStrategy, Component } from "@angular/core";
import { TicketDetailComponent } from "./components/ticket-detail/ticket-detail.component";
export const CHILD_ROUTES1 = [
  
    { path: 'ticket1/:id', component: TicketDetailComponent },
]
@Component({
    selector: 'app-faq',
    templateUrl: './faq.component.html',
    // styleUrl: './doro.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    // providers: [
    //     { provide: 'routes', useValue: CHILD_ROUTES1}
    // ],
})
export class FaqComponent {
    
}