import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'remote-product-button-faq2',
  template: `
    <button
      [ngStyle]="{ 'background-image': 'url(' + imageUrl + ')' }"
      (click)="onClick()"
    >
      Click Me 2
    </button>
  `,
  styles: [
    `
      button {
        padding: 10px 20px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        background-size: cover;
      }
    `,
  ],
})
export class ProductButtonRemote2Component {
  @Input() imageUrl: string = ''; // Input property for the image URL
  @Output() remoteButtonClick = new EventEmitter<string>(); // Output event

  onClick() {
    this.remoteButtonClick.emit('Button clicked!'); // Emit the event
  }
}