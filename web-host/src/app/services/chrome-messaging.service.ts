// src/app/services/chrome-messaging.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
interface MyMessage {
  action: string;
  data: { key: string };
}

@Injectable({
  providedIn: 'root',
})
export class ChromeMessagingService {
  private _messageSubject = new Subject<any>();

  constructor() {
    this.listenForMessages();
  }

  // Listen for messages from background.js
  private listenForMessages() {
    if (chrome && chrome?.runtime && chrome?.runtime.onMessage) {
      chrome?.runtime.onMessage.addListener((
        message: MyMessage, 
        sender: chrome.runtime.MessageSender, 
        sendResponse: (response?: any) => void
      ) => {
        this._messageSubject.next(message);
        sendResponse({ status: 'Message received in Angular app' });
      });
    } else {
      console.warn('chrome.runtime.onMessage is not available.');
    }
  }

  // Expose the message as an observable
  get messages() {
    return this._messageSubject.asObservable();
  }
}