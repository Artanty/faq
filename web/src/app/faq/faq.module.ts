import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { TicketDetailComponent } from "./components/ticket-detail/ticket-detail.component";
import { TicketListComponent } from "./components/ticket-list/ticket-list.component";
import { FaqComponent } from "./faq.component";
export const CHILD_ROUTES = [
    {
        path: '',
        component: FaqComponent,
    },
    { path: 'ticket/:id', component: TicketDetailComponent },
]
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
        RouterModule.forChild(CHILD_ROUTES),
        HttpClientModule,
    ],
    providers: [
        // { provide: 'routes', useValue: CHILD_ROUTES}
    ],
    exports: [
        FaqComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FaqModule {
    static routes = CHILD_ROUTES;
}