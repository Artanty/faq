import { Component, EventEmitter, Input, Output } from '@angular/core'
@Component({
  selector: 'app-product-button-text',
  template: `
    <app-button 
      [routerLink]="url"
      [routerLinkActive]="active"
      [routerLinkActiveOptions]="routerLinkActiveOptions"
      p="4px 10px"
      color="white"
      fz="14px"
      (click)="onButtonClick()"
    >
      
    </app-button>
  `,
  styles: `@import '~@assets/typicons/typicons.css';`
})
export class ProductButtonTextComponent {
  @Input() text: string = ''
  @Input() h: string | undefined;
  @Input() color: string = 'green'
  @Input() url: string = ''  
  @Input() active: string  = ''
  @Input() routerLinkActiveOptions: { exact: boolean } = { exact: false };

  @Output() buttonClick = new EventEmitter<string>();

  public onButtonClick() {
    this.buttonClick.emit('')
    // console.log(this.active)
    // console.log(this.url)
  }
}
