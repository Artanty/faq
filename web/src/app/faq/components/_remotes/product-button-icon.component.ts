import { Component, EventEmitter, Input, Output } from '@angular/core'
@Component({
  selector: 'app-product-button-icon',
  template: `
    <app-button 
      [routerLink]="url"
      [routerLinkActive]="active"
      [routerLinkActiveOptions]="routerLinkActiveOptions"
      p="0px 0px"
      color="white"
      h="24px"
      w="26px"
      (click)="onButtonClick()"
    >
      <i [class]="'typcn '+icon"></i>
    </app-button>
  `,
  styles: `@import '~@assets/typicons/typicons.css';`
})
export class ProductButtonIconComponent {
  @Input() icon: string = 'typcn-weather-stormy'
  @Input() h: string | undefined;
  @Input() color: string = 'green'
  @Input() url: string = ''  
  @Input() active: string  = ''
  @Input() routerLinkActiveOptions: { exact: boolean } = { exact: false };

  @Output() buttonClick = new EventEmitter<string>();

  public onButtonClick() {
    this.buttonClick.emit('')
  }
}
