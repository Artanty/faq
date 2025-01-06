import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {

  @Input() type: string = 'button'; // Default to 'button' if not provided
  @Input() disabled: boolean = false; // Default to false if not provided
  @Input() title: string = ''; // Tooltip text
  @Input() color: string = 'green'
      
}