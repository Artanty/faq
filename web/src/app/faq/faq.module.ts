import { APP_BASE_HREF, CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, Injector, InjectionToken, Provider } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { TicketDetailComponent } from "./components/ticket-detail/ticket-detail.component";
import { TicketListComponent } from "./components/ticket-list/ticket-list.component";
import { FaqComponent } from "./faq.component";
import { TicketCreateComponent } from './components/ticket-create/ticket-create.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { TextareaComponent } from './components/textarea/textarea.component';
import { SelectComponent } from './components/select/select.component';
import { ButtonComponent } from './components/button/button.component';
import { AnswerListComponent } from './components/answer-list/answer-list.component';
import { FlipComponent } from './components/flip/flip.component';
import { ScheduleCreateComponent } from './components/schedule-create/schedule-create.component';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { ScheduleListComponent } from './components/schedule-list/schedule-list.component';
import { AssetUrlUpdateDirective } from "./directives/asset-url-update.directive";
import { CoreService } from "./services/core.service";

import { ProductButtonTextComponent } from "./components/_remotes/product-button-add/product-button-text.component";
import { ProductButtonIconComponent } from "./components/_remotes/product-button-add/product-button-icon.component";
import { TicketQueueService } from "./services/ticketQueue.service";
import { OpenerService } from "./services/opener.service";




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
                path: 'ticket-create', component: TicketCreateComponent
            },
            { 
                path: 'ticket-list', component: TicketListComponent
            }, 
            { 
                path: 'answer-list/:id', component: AnswerListComponent
            },
            {
                path: 'schedule-create', component: ScheduleCreateComponent
            },
            {
                path: 'schedule-list', component: ScheduleListComponent
            }
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
        ButtonComponent,
        AnswerListComponent,
        FlipComponent,
        ScheduleCreateComponent,
        DatePickerComponent,
        ScheduleListComponent,
        AssetUrlUpdateDirective,
        ProductButtonIconComponent,
        ProductButtonTextComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule.forChild(CHILD_ROUTES),
        HttpClientModule,
    ],
    providers: [
        OpenerService,
        CoreService,
        TicketQueueService,
    ],
    exports: [
        FaqComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FaqModule {
    ngDoBootstrap() {}
}