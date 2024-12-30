import { loadRemoteModule } from "@angular-architects/module-federation"
import {
  Component,
  OnInit,
} from "@angular/core"
import { Router, Routes } from "@angular/router"

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit {

  ngOnInit(): void {}
  constructor(
    private router: Router
  ) {
    this.loadComponent()
    console.log(this.router)
  }

  async loadComponent(): Promise<void> {
    
    const m = await loadRemoteModule({
      remoteName: "webHost",
      remoteEntry: "./assets/mfe/web-host/remoteEntry.js",
      // remoteEntry: "http://localhost:4221/remoteEntry.js",
      exposedModule: "./Module",
    })

    const childRoutes: Routes = [
      {
        path: 'child',
        loadChildren: () => m.FaqModule,
      },
    ];

    this.router.resetConfig([...this.router.config, ...childRoutes]);
    // this.router.navigate(['/child/ticket/1']);
  }
}
