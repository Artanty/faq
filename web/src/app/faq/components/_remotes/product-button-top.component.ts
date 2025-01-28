import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output } from '@angular/core'
import { ButtonComponent2 } from '../button2/button.component';
import { ProductCardComponent } from './product-card/product-card.component';
@Component({
  selector: 'app-product-button-icon',
  // template: `
  //   <app-button2 
  //     [routerLink]="url"
  //     [routerLinkActive]="active"
  //     [routerLinkActiveOptions]="routerLinkActiveOptions"
  //     p="0px 0px"
  //     color="white"
  //     h="24px"
  //     w="26px"
  //     (click)="onButtonClick()"
  //   >
  //     <i [class]="'typcn '+icon"></i>
  //   </app-button2>
  //   <img class="img" [src]="src" alt="FAQ Image">

  // `,
  template: `<app-product-card></app-product-card>`,
  styles: `@import '~@assets/typicons/typicons.css';
  .img{
        width: 100px;
  }
  `,
  imports: [ButtonComponent2, ProductCardComponent],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProductButtonTopComponent {
  @Input() icon: string = 'typcn-weather-stormy'
  @Input() h: string | undefined;
  @Input() color: string = 'green'
  @Input() url: string = ''  
  @Input() active: string  = ''
  @Input() routerLinkActiveOptions: { exact: boolean } = { exact: false };

  @Output() buttonClick = new EventEmitter<string>();

  public src = `${__webpack_public_path__}assets/images/faqImg.jpg`

  public onButtonClick() {
    this.buttonClick.emit('')
  }
}
// import { Component, Output, EventEmitter } from '@angular/core';

// @Component({
//   selector: 'app-remote-top-button',
//   template: `
//     <button (click)="onClick()">Click Me (Remote)</button>
//   `,
// })
// export class ProductButtonTopComponent {
//   @Output() buttonClick = new EventEmitter<void>();

//   onClick(): void {
//     this.buttonClick.emit();
//   }
// }
