import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  @Input() name: string = ''
  
  @Input() title: string = ''
  @Input() imgSrcBaseUrl: string = ''
  @Input() routerLinkActiveOptions: { exact: boolean } = { exact: false };
  @Input() routerPath: string = ''
  
  @Output() buttonClick = new EventEmitter<string>();
  
  public onButtonClick() {
    this.buttonClick.emit('')
  }
}
