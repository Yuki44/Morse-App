import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MessageService} from './shared/message.service';
import {Observable} from 'rxjs/Observable';
import {animate, state, style, transition, trigger} from '@angular/animations';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/merge';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css'],
  animations: [
    trigger('flyInOut', [
      state('in', style({transform: 'translateY(0)'})),
      transition('void => *', [
        style({transform: 'translateY(100%)'}),
        animate(500)
      ]),
      transition('* => void', [
        animate(500, style({transform: 'translateY(-100%)'}))
      ])
    ])
  ]
})
export class MessageComponent implements OnInit, AfterViewChecked {
  @ViewChild('myInputField') myInputField: any;
  @ViewChild('myMorseButton') myMorseButton: any;
  @ViewChild('userInput') userInput: any;


  textToMorseMessage: string;

  title = 'Morse App';
  messages: any[];
  messagesPaged: Observable<any[]>;
  latest: any;
  message = '';
  morseActivated = false;
  textActivated = false;
  humanReadableMessage = '';
  time: number;
  messageType = 'Text';
  morseAlphabet = this.getMorseAlphabet();
  closeResult: string;
  user = '';



  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  constructor(private messageService: MessageService, private modalService: NgbModal) {
    this.messageService.getMessagesLastByLimit(50).subscribe(messages => {
      this.messages = messages.reverse();
      this.latest = messages[0];
    });
    this.scrollToBottom();
  }

  ngOnInit() {
    this.scrollToBottom();
  }

  convertMessage(message: string): string {
    return this.messageService.convertToText(message);
  }

  getMorseAlphabet() {
    return {
      'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
      'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
      'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
      'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
      'Y': '-.--', 'Z': '--..', ' ': '/',

      '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
      '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.'
    };
  }

  convertToMorse(text: string): string {
    let morse = '';
    const words = text.toString();
    for (const word of words) {
      const chars = word;
      for (const char of chars) {
        const letter = this.morseAlphabet[char.toUpperCase()];
        if (letter !== undefined) {
          morse += letter;
        } else {
          morse += char;
        }
      }
      morse += ' ';
    }
    return this.message = morse;
  }

  sendCheck() {
    if (this.textToMorseMessage) {
      this.send();
    } else {
    }
  }


  send() {
    const time = new Date();
    const user = this.user;
    this.messageService.addMessage(user, time, this.message.trim()).then(done => {
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
    this.scrollToBottom();
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
    this.textToMorseMessage = '';
  }

  normalTextActive() {
    this.morseActivated = false;
    this.textActivated = true;
    this.clear();
    this.scrollToBottom();
    this.focusFieldsInView();
  }

  morseActive() {
    this.textActivated = false;
    this.morseActivated = true;
    this.clear();
    this.scrollToBottom();
    this.focusFieldsInView();
  }

  cancelMessage(contentUser) {
    this.morseActivated = false;
    this.textActivated = false;
    this.clear();
    if (contentUser) {
      this.open(contentUser);
    }
  }

  focusFieldsInView() {
    try {
      if (this.morseActivated) {
        this.myMorseButton.nativeElement.focus();
      } else {
        this.myInputField.nativeElement.focus();
      }
    } catch (err) {

    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
    this.focusFieldsInView();
  }


  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {

    }

  }

  changed(string, event) {
    if (event.srcElement.checked) {
      this.messageType = string;
    }
    if (this.messageType === 'Text') {
      this.message = this.textToMorseMessage;
      this.convertToMorse(this.message);
    }
  }


  open(content) {
    this.modalService.open(content).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });

  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }



}
