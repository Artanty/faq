import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { TicketDetailComponent } from "./components/ticket-detail/ticket-detail.component";
import { TicketListComponent } from "./components/ticket-list/ticket-list.component";
import { FaqComponent } from "./faq.component";

@NgModule({
    declarations: [
        FaqComponent,
        TicketListComponent,
        TicketDetailComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule.forChild([
            {
                path: '',
                component: FaqComponent,
            },
            // { path: 'ticket/:id', component: TicketDetailComponent },
        ]),
        HttpClientModule,
    ],
    providers: [],
    exports: [
        FaqComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FaqModule {}