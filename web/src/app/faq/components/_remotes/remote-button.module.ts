import { NgModule } from '@angular/core';
import { ProductButtonTopComponent } from './product-button-top.component';
import { CommonModule } from '@angular/common';
import { FontInitializerService } from '../../services/font-initializer.service';
import { ProductCardComponent } from './product-card/product-card.component';

@NgModule({
  imports: [CommonModule, ProductButtonTopComponent],
  exports: [ProductButtonTopComponent],
})
export class RemoteButtonModule {
  static components = [ProductCardComponent, ProductButtonTopComponent];
  static services = [FontInitializerService]
}