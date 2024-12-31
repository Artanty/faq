import { loadRemoteModule } from "@angular-architects/module-federation"
import {
  Component,
  OnInit,
} from "@angular/core"
import { Router, Routes } from "@angular/router"
import { ChromeMessagingService } from "./services/chrome-messaging.service"

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit {

  message: string | null = null;

  constructor(
    private router: Router,
    private chromeMessagingService: ChromeMessagingService
  ) {
    this.loadComponent()
    // console.log(this.router)
  }

  ngOnInit(): void {
    this.chromeMessagingService.messages.subscribe((message) => {
      this.message = message.message;
      console.log('Message received in Angular app:', message);
    });
  }

  async loadComponent(): Promise<void> {
    
    const m = await loadRemoteModule({
      remoteName: "webHost",
      // remoteEntry: "./assets/mfe/web-host/remoteEntry.js",
      // remoteEntry: "http://localhost:4221/remoteEntry.js",
      remoteEntry: `${process.env["FAQ_WEB_REMOTE_ENTRY_URL"]}`,
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
