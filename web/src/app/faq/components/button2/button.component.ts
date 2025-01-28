import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-button2',
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  standalone: true,
  imports: [CommonModule]
})
export class ButtonComponent2 {
  @Input() w: string | undefined;
  @Input() h: string | undefined;
  @Input() p: string | undefined;
  @Input() type: string = 'button';
  @Input() disabled: boolean = false;
  @Input() title: string = '';
  @Input() color: string = 'green'
  @Input() fz: string = '16px'
  @Input() fw: string = '600'
  
  @Output() buttonClick = new EventEmitter<string>();

  public onButtonClick(data: any) {
    this.buttonClick.emit('')
  }
}