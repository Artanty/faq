import { webComponentService } from 'typlib';

class RemoteButtonComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    if (this.shadowRoot) {
            this.shadowRoot.innerHTML = `
            <style>
            button {
                padding: 10px 20px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                background-size: cover;
            }
            </style>
            <button id="button">Click Me</button>
        `;

        this.shadowRoot.getElementById('button')?.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('remoteButtonClick', { detail: 'Button clicked!' }));
        });
    }
  }

  set imageUrl(url: string) {
    if (this.shadowRoot) {
        const button = this.shadowRoot.getElementById('button');
        if (button) {
            button.style.backgroundImage = `url(${url})`;
        }
    }
  }
}

export function registerRemoteButtonComponent() {
    webComponentService.registerComponent('remote-product-button-faq', RemoteButtonComponent)
}