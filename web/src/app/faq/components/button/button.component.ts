import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() w: string | undefined;
  @Input() p: string | undefined;
  @Input() type: string = 'button';
  @Input() disabled: boolean = false;
  @Input() title: string = '';
  @Input() color: string = 'green'
  @Input() fz: string = '16px'
  @Input() fw: string = '600'
  
}