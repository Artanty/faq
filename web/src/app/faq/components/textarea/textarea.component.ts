import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-textarea',
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss'
})
export class TextareaComponent {
  @Input() textarea: boolean = false;
  @Input() value: string = '';
  @Input() label: string = '';
  @Input() rows: number= 6;
  @Input() helperText: string = '';
  @Input() required: boolean = false;
  @Input() disallow: boolean = false;

  @Output() valueChange = new EventEmitter<string>();

  onValueChange(newValue: string) {
    this.value = newValue;
    this.valueChange.emit(newValue);
  }
}
