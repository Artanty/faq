import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'remote-product-button-faq3',
  templateUrl: 'product-button.component.html',
  styleUrl: 'product-button.component.scss'
})
export class ProductButtonRemote3Component {
  @Input() imageUrl: string = ''; // Input property for the image URL
  @Output() remoteButtonClick = new EventEmitter<string>(); // Output event

  onClick() {
    this.remoteButtonClick.emit('Button clicked!'); // Emit the event
  }
}