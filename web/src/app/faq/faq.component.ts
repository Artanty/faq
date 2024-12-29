import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    selector: 'app-faq',
    templateUrl: './faq.component.html',
    // styleUrl: './doro.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaqComponent {
    
}