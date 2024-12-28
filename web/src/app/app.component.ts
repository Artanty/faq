import { loadRemoteModule } from "@angular-architects/module-federation"
import {
  Component,
  Injector,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from "@angular/core"

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit {
  // @ViewChild("placeHolder", { read: ViewContainerRef })
  // viewContainer!: ViewContainerRef

  title = "web"

  constructor(private injector: Injector) {
  
  }

  ngOnInit(): void {}
  
}
