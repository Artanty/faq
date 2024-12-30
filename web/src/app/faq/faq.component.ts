import { ChangeDetectionStrategy, Component } from "@angular/core";
import { TicketDetailComponent } from "./components/ticket-detail/ticket-detail.component";

@Component({
    selector: 'app-faq',
    templateUrl: './faq.component.html',
    styleUrl: './faq.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class FaqComponent {}