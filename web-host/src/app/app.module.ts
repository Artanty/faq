import { HttpClientModule } from "@angular/common/http"
import { NgModule } from "@angular/core"
import { ReactiveFormsModule } from "@angular/forms"
import { BrowserModule } from "@angular/platform-browser"
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { BehaviorSubject } from "rxjs"
import { BusEvent, EVENT_BUS, HOST_NAME } from "typlib"
import { AppRoutingModule } from "./app-routing.module"
import { AppComponent } from "./app.component";
import { TestComponent } from './components/test/test.component'

@NgModule({
  declarations: [AppComponent, TestComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
  ],
  providers: [
    { provide: 'routes', useValue: [] }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
