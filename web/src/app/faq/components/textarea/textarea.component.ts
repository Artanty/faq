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

  @Output() valueChange = new EventEmitter<string>(); // Output property to emit changes

  // Method to update the value and emit changes
  onValueChange(newValue: string) {
    this.value = newValue;
    this.valueChange.emit(newValue);
  }
}
