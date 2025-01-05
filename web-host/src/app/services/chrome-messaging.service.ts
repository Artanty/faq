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
    this._listenForMessages();
    
  }

  // Expose the message as an observable
  public get messages() {
    return this._messageSubject.asObservable();
  }

   // Listen for messages from background.js
   private _listenForMessages() {
    if (chrome && chrome?.runtime && chrome?.runtime.onMessage) {
      chrome?.runtime.onMessage.addListener((
        message: MyMessage, 
        sender: chrome.runtime.MessageSender, 
        sendResponse: (response?: any) => void
      ) => {
        this._messageSubject.next(message);
        console.log('HOST received message: ' )
        console.log(message)
        sendResponse(true);
      });
    } else {
      console.warn('chrome.runtime.onMessage is not available.');
    }
  }
}