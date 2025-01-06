import { Component, Input, Output, EventEmitter } from '@angular/core';

interface SelectObject {
  id: number | string;
  name: string;
  [key: string]: any;
}

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
})
export class SelectComponent {
  @Input() label: string = ''; 
  @Input() options: SelectObject[] = [];
  @Input() value: SelectObject["id"] = '';
  @Output() valueChange = new EventEmitter<SelectObject["id"]>();

  onValueChange(event: any) {
    this.value = event;
    this.valueChange.emit(this.tryToNumber(this.value));
  }

  private tryToNumber (stringValue: SelectObject["id"]): string | number {
    const numericValue = Number(stringValue);
    return !isNaN(numericValue)
      ? numericValue
      : stringValue
  }
}