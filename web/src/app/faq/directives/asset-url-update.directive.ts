import { Directive, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { CoreService } from '../services/core.service';

@Directive({
  selector: '[assetUrlUpdate]',
})
export class AssetUrlUpdateDirective implements OnInit {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private coreService: CoreService
  ) {}

  ngOnInit() {
    if (this.coreService.isInsideHost() === true) {
      this.updateAssetUrl();
    }
  }

  private updateAssetUrl() {
    const element: HTMLElement = this.el.nativeElement;
    
    const computedStyles = window.getComputedStyle(element);

    const backgroundImage = computedStyles.getPropertyValue('background-image');

    if (backgroundImage && backgroundImage.startsWith('url(')) {

      const initialUrl = backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];

      if (initialUrl && initialUrl.includes('/assets/')) {
        const updatedUrl = this._buildNewUrl(initialUrl)
        this.renderer.setStyle(element, 'background-image', updatedUrl);
      }
    }
  }

  private _buildNewUrl (initialUrl: string) {
    let updatedUrl = ''
    if (this.coreService.isDev() === true) {
      const mfeBaseUrl = this.coreService.getBaseUrl()
      updatedUrl = initialUrl.replace(/^.*assets\//, mfeBaseUrl + 'assets/');
    } else {
      const mfeAssetsPath = `${this.coreService.getRouterPath()}/assets/`
      updatedUrl = initialUrl.replace(/\/assets\//, `/assets/mfe/${mfeAssetsPath}`);
    }
    return `url(${updatedUrl}?t=${Date.now()})`;
  }
}