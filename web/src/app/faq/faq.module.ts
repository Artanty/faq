import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, Injector } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { TicketDetailComponent } from "./components/ticket-detail/ticket-detail.component";
import { TicketListComponent } from "./components/ticket-list/ticket-list.component";
import { FaqComponent } from "./faq.component";
import { BusEvent, EVENT_BUS } from "typlib";
import { BehaviorSubject } from "rxjs";
import { TicketCreateComponent } from './components/ticket-create/ticket-create.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { TextareaComponent } from './components/textarea/textarea.component';
import { SelectComponent } from './components/select/select.component';

export const CHILD_ROUTES = [
    {
        path: '',
        component: FaqComponent,
        children: [
            {
                path: '', component: WelcomeComponent
            },
            {
                path: 'ticket', component: TicketDetailComponent
            },
            { 
                path: 'ticket/:id', component: TicketDetailComponent
            }, 
            {
                path: 'ticketCreate', component: TicketCreateComponent
            },
            { 
                path: 'ticketList', component: TicketListComponent
            }, 
        ]
    }, 
]

@NgModule({
    declarations: [
        FaqComponent,
        TicketListComponent,
        TicketDetailComponent,
        TicketCreateComponent,
        WelcomeComponent,
        TextareaComponent,
        SelectComponent,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule.forChild(CHILD_ROUTES),
        // RouterModule.forChild([]),
        HttpClientModule,
    ],
    // providers: [
    //     { provide: 'routes', useValue: CHILD_ROUTES}
    //     { provide: EVENT_BUS, useValue: eventBus$ },
    // ],
    exports: [
        FaqComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FaqModule {
    // static routes = CHILD_ROUTES;
}