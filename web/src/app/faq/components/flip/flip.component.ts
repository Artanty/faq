// flip.component.ts
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-flip',
  templateUrl: './flip.component.html',
  styleUrls: ['./flip.component.scss'],
})
export class FlipComponent {
  private _side: 'front' | 'back' = 'front'; // Private backing field for the input

  @Input()
  set side(value: 'front' | 'back') {
    this._side = value; // Update the backing field
    this.rotation = value === 'front' ? 0 : 180; // Update the rotation value
  }
  get side(): 'front' | 'back' {
    return this._side; // Return the current side
  }

  rotation = 0; // Track the rotation angle
}