import { Directive, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { CoreService } from '../services/core.service';

@Directive({
  selector: '[assetUrlUpdate]',
})
export class AssetUrlUpdateDirective implements OnInit {
  constructor(
    private el: ElementRef, // Inject ElementRef to access the DOM element
    private renderer: Renderer2, // Inject Renderer2 to safely manipulate styles
    private coreService: CoreService // Inject the service
  ) {}

  ngOnInit() {
    this.updateAssetUrl();
  }

  private updateAssetUrl() {
  
    const prependString = this.coreService.getRouterPath();

    if (prependString !== '/') {
      const element = this.el.nativeElement;

      this.updateBackgroundImage(element, prependString);
    }
  }

  private updateBackgroundImage(element: HTMLElement, prependString: string) {
    // Get the element's computed styles
    const computedStyles = window.getComputedStyle(element);

    // Check for specific CSS properties (e.g., background-image)
    const backgroundImage = computedStyles.getPropertyValue('background-image');

    if (backgroundImage && backgroundImage.startsWith('url(')) {
      // Extract the URL from the background-image property
      const url = backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];

      if (url && url.includes('/assets/')) {
        // Update the URL with the prepended string
        const newUrl = url.replace(/\/assets\//, `/assets/mfe/${prependString}/assets/`);

        // Append a cache-busting query parameter
        const finalUrl = `url(${newUrl}?t=${Date.now()})`;
console.log('finalUrl: ' + finalUrl)
        // Apply the updated URL to the element
        this.renderer.setStyle(element, 'background-image', finalUrl);
      }
    }
  }
}