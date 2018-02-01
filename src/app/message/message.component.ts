import {Component} from '@angular/core';
import {MessageService} from './shared/message.service';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent {
  title = 'Morse App';
  messages: any[];
  messagesPaged: Observable<any[]>;
  latest: any;
  message = '';
  morseActivated = false;
  textActivated = false;
  humanReadableMessage = '';
  time: number;

  constructor(private messageService: MessageService) {
    this.messageService.getMessagesLastByLimit(3).subscribe(messages => {
      this.messages = messages;
      this.latest = messages[0];
    });
  }

  convertMessage(message: string): string {
    return this.messageService.convertToText(message);
  }

  send() {
    const time = new Date();
    this.messageService.addMessage(time, this.message.trim()).then(done => {
      console.log('saved');
    }, err => {
      console.log(err);
    });
    this.clear();
  }

  morse(active) {
    if (active) {
      this.time = (new Date()).getTime();
    } else {
      const clickTime = (new Date()).getTime() - this.time;
      if (clickTime > 120) {
        this.message += '-';
      } else {
        this.message += '.';
      }
      this.time = -1;
    }
  }

  space() {
    this.message += '/';
    this.humanReadableMessage = this.messageService.convertToText(this.message);
  }

  next() {
    this.message += ' ';
    this.humanReadableMessage = this.messageService.convertToText(this.message);
  }

  clear() {
    this.message = '';
    this.humanReadableMessage = '';
  }

  normalTextActive() {
    this.morseActivated = false;
    this.textActivated = true;
  }

  morseActive() {
    this.textActivated = false;
    this.morseActivated = true;
  }


}
