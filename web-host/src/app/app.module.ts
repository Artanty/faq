import { HttpClientModule, provideHttpClient, withInterceptors } from "@angular/common/http"
import { NgModule } from "@angular/core"
import { ReactiveFormsModule } from "@angular/forms"
import { BrowserModule } from "@angular/platform-browser"
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { BehaviorSubject } from "rxjs"
import { BusEvent, EVENT_BUS, HOST_NAME } from "typlib"
import { AppRoutingModule } from "./app-routing.module"
import { AppComponent } from "./app.component";
import { TestComponent } from './components/test/test.component';
import { GroupButtonsDirective } from './directives/group-buttons.directive';
import { HomeComponent } from './components/home/home.component'
import { CoreService } from "./services/core.service";
import { ProductCardComponent } from './components/product-card/product-card.component'
import { BusEventStoreService } from "./services/bus-event-store.service"
import { authInterceptor } from "./interceptors/auth.interceptor"

export const initBusEvent: BusEvent = {
  event: "INIT",
  from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
  to: "",
  payload: {}
}

const eventBus$ = new BehaviorSubject(initBusEvent)

@NgModule({
  declarations: [
    AppComponent, 
    TestComponent,
    GroupButtonsDirective, 
    HomeComponent, ProductCardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    // HttpClientModule,
  ],
  providers: [
    { provide: EVENT_BUS, useValue: eventBus$ },
    CoreService,
    // BusEventStoreService
    { provide: HOST_NAME, useValue: 'faq@web-host' },
    {
      provide: 'components',
      useValue: {},
      multi: true,
    },
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ],
  bootstrap: [AppComponent], 
})
export class AppModule {
  constructor(
    // @Inject('EVENT_BUS') private eb: BehaviorSubject<BusEvent>
  ) {
    // this.eventBus$.
    eventBus$.asObservable().subscribe(res => {
      console.log('MAIN HOST EVENT: ' + res.event)
    })
  }
}
