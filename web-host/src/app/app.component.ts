import { loadRemoteModule } from "@angular-architects/module-federation"
import {
  Component,
  Injector,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from "@angular/core"
import { Router, Routes } from "@angular/router"

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit {
  @ViewChild("placeHolder", { read: ViewContainerRef })
  viewContainer!: ViewContainerRef

  title = "web-host"

  
  ngOnInit(): void {}
  constructor(
    // private injector: Injector,
    // private viewContainer: ViewContainerRef,
    // private router: Router
  ) {
    this.loadComponent()
  }
  
  // async loadComponent(): Promise<void> {
  //   // Load the child MFE module
  //   const m = await loadRemoteModule({
  //     remoteName: 'webHost',
  //     remoteEntry: 'http://localhost:4221/remoteEntry.js',
  //     exposedModule: './Component',
  //   });

  //   // Create the child component
  //   const componentRef = this.viewContainer.createComponent(m.FaqComponent);

  //   // Add the child MFE routes to the host router
  //   const childRoutes: Routes = [
  //     {
  //       path: 'child',
  //       component: componentRef.instance as any, // Use the dynamically loaded component
  //       children: [
  //         { path: '', component: m.FaqComponent }, // Default route
  //         { path: 'ticket/:id', component: m.TicketDetailComponent },
  //       ],
  //     },
  //   ];

  //   // Add the child routes to the host router
  //   this.router.resetConfig([...this.router.config, ...childRoutes]);

  //   // Navigate to the child MFE's default route
  //   this.router.navigate(['/child']);
  // }
  async loadComponent(): Promise<void> {
    const m = await loadRemoteModule({
      remoteName: "webHost",
      // remoteEntry: "./assets/mfe/web-mfe/remoteEntry.js",
      remoteEntry: "http://localhost:4221/remoteEntry.js",
      exposedModule: "./Component",
    })
    this.viewContainer.createComponent(m.FaqComponent)

    // this.viewContainer.createComponent(m.DoroComponent, {
    //   injector: this.injector,
    // })
    // this.viewContainer.createComponent(m.DoroComponent, {
    //   injector: Injector.create({
    //     providers: [],
    //     parent: this.injector,
    //   }),
    // })

    // const m = await loadRemoteModule({
    //   remoteName: "au",
    //   remoteEntry: "./assets/mfe/au/remoteEntry.js",
    //   exposedModule: "./Component",
    // })

    // this.viewContainer.createComponent(m.AuthComponent, {
    //   injector: Injector.create({
    //     providers: [
    //       { provide: EVENT_BUS, useValue: this.authEventBus$ },
    //       { provide: PRODUCT_NAME, useValue: "doro" },
    //     ],
    //   }),
    // })
  }
}
