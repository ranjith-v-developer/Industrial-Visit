import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatbotServiceApi } from '../services/chatbot-api.service';
import { SharedModule } from '../shared.module';
import { VoiceRecognitionService } from '../services//voice-recognition.service';
import { isEmpty } from 'lodash';
import dayjs from 'dayjs';

@Component({
  selector: 'chatbot',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, SharedModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss',
})
export class ChatbotComponent {
  public isOpen = false;
  public showRobot = true;
  public searchText = '';
  public loading = false;
  public chatData = [
    { type: 'bot', message: `Hello there! 👋 It's nice to meet you!`, seqCode: 1 },
    { type: 'bot', message: 'Example for location: show me the industrial visits near avadi', seqCode: 2 },
    { type: 'bot', message: 'Example for department: கணினி அறிவியல் மற்றும் பொறியியல்', seqCode: 3 },
  ]
  public userData: any = {};
  public isListening: boolean = false;
  public listenText = '';
  public closeTexts = [
    'good bye', 'goodbye', 'bye', 'thank you', 'thankyou',
    'stop', 'done', 'welldone', 'well done'
  ]

  constructor(
    private chatbotServiceApi: ChatbotServiceApi,
    private voiceRecognitionService: VoiceRecognitionService
  ) { }

  public async ngOnInit() {
    this.userData = localStorage.getItem('userData')
    this.userData = JSON.parse(this.userData)
    this.checkRecording();
  }

  public checkRecording = () => {
    setInterval(() => {
      this.voiceRecognitionService.isRecording.subscribe(val => {
        this.listenText = val;
        this.isListening = ![ 'Completed', 'Error', 'Canceled' ].includes(val);
      })
    }, 1000)
  }

  public toggleChatbot() {
    this.isOpen = !this.isOpen;
    this.showRobot = false;
    if (!this.isOpen) {
      setTimeout(() => {
        this.showRobot = true;
      }, 300);
    } else {
      setTimeout(() => {
        const el = document.querySelector('.chatbot-content-container');
        if (el) {      
          el.scrollTo({
            top: el.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 400);

      
    }
  }

  onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchText = inputElement.value;
  }

  async sendText() {
    this.chatData.push({
      type: 'user',
      message: this.searchText,
      seqCode: this.chatData.length + 1
    })
    this.loading = true;
    const data = {
      input: this.searchText.trim().toLocaleLowerCase()
    }
    const beforeEl = document.querySelector('.chatbot-content-container');
    if (beforeEl) {      
      setTimeout(() => {
        beforeEl.scrollTo({
          top: beforeEl.scrollHeight,
          behavior: "smooth",
        });
      }, 100); 
    }
    try {
      if (this.closeTexts.includes(this.searchText.trim())) {
        this.loading = false;
        this.chatData.push({
          type: 'bot',
          message: `
              <p class="iv-description">You're welcome! 😊 I'm glad you liked it!</p>
            `,
          seqCode: this.chatData.length + 1
        })
        return
      }
      this.searchText = '';
      await this.chatbotServiceApi.chatbotRequest(data).then((res: any) => {
        this.loading = false;
        if (res.length > 0) {
          res.forEach((ivData: any) => {
            this.chatData.push({
              type: 'bot',
              message: `
                  <h3 class="iv-name">${ivData.name}</h3>
                  <p class="iv-description">${ivData.tran.description}</p>
                  <p class="iv-start">From - ${dayjs(ivData.start_date).format('DD/MM/YYYY')}</p>
                  <p class="iv-end">To - ${dayjs(ivData.end_date).format('DD/MM/YYYY')}</p>
                  <a class="iv-link" href='/industrial-visits/${ivData.id}'>Click Here</a>
                `,
              seqCode: this.chatData.length + 1
            })
          });
        } else {
          this.chatData.push({
            type: 'bot',
            message: `
                <p class="iv-description">No records found, Try again later</p>
              `,
            seqCode: this.chatData.length + 1
          });
        }
      })
    } catch (error) {
      this.loading = false;
      this.searchText = ''
    }
    const afterEl = document.querySelector('.chatbot-content-container');
    if (afterEl) {      
      setTimeout(() => {
        afterEl.scrollTo({
          top: afterEl.scrollHeight,
          behavior: "smooth",
        });
      }, 100); 
    }
  }

  async startListening() {
    try {
      await this.voiceRecognitionService.startListening().then(async (res) => {
        if (isEmpty(res)) {
          this.isListening = false;
          return
        }
        this.chatData.push({
          type: 'user',
          message: res.text,
          seqCode: this.chatData.length + 1
        });
        this.loading = true;
        if (this.closeTexts.includes(res.text.trim())) {
          this.loading = false;
          this.chatData.push({
            type: 'bot',
            message: `
                <p class="iv-description">You're welcome! 😊 I'm glad you liked it!</p>
              `,
            seqCode: this.chatData.length + 1
          })
          return
        }
        const beforeEl = document.querySelector('.chatbot-content-container');
        if (beforeEl) {      
          setTimeout(() => {
            beforeEl.scrollTo({
              top: beforeEl.scrollHeight,
              behavior: "smooth",
            });
          }, 100); 
        }
            // Get chatbot response
        const chatbotResponse: any = await this.chatbotServiceApi.chatbotRequest({ input: res.text.trim().toLocaleLowerCase() });
        this.loading = false;

        if (chatbotResponse?.length > 0) {
          chatbotResponse.forEach((ivData: any) => {            
            this.chatData.push({
              type: 'bot',
              message: `
                  <h3 class="iv-name">${ivData.name}</h3>
                  <p class="iv-description">${ivData.tran?.description || 'No description available'}</p>
                  <p class="iv-start">From - ${dayjs(ivData.start_date).format('DD/MM/YYYY')}</p>
                  <p class="iv-end">To - ${dayjs(ivData.end_date).format('DD/MM/YYYY')}</p>
                  <a class="iv-link" href='/industrial-visits/${ivData.id}'>Click Here</a>
                `,
              seqCode: this.chatData.length + 1
            });
          });
        } else {
          this.chatData.push({
            type: 'bot',
            message: `
                <p class="iv-description">No records found, Try again sometimes</p>
              `,
            seqCode: this.chatData.length + 1
          });
        }
      });
    } catch (error) {
      console.error('Error processing chatbot request:', error);
      this.isListening = false;
      this.loading = false;
    }
    const afterEl = document.querySelector('.chatbot-content-container');
    if (afterEl) {      
      setTimeout(() => {
        afterEl.scrollTo({
          top: afterEl.scrollHeight,
          behavior: "smooth",
        });
      }, 100); 
    }
  }

  async stopListening() {
    this.voiceRecognitionService.cancelListening();
    this.loading = false;
  }
}
