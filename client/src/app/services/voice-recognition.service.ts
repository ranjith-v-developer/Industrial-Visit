import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VoiceRecognitionService {
  private mediaRecorder!: MediaRecorder;
  private audioChunks: Blob[] = [];
  private mediaStream!: MediaStream;
  private audioContext!: AudioContext;
  private analyser!: AnalyserNode;
  private silenceTimer: any;
  public isRecording = new Subject<string>();
  public isCanceled = false;

  constructor(private http: HttpClient) {}

  /** Start Speech Recognition (Detect Silence) */
  async startListening(): Promise<any> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: {
        noiseSuppression: true,
        echoCancellation: true,
        autoGainControl: true,
      }, });
      this.mediaStream = stream;
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.isRecording.next('Listening');
      this.isCanceled = false;

      // Capture audio chunks
      this.mediaRecorder.ondataavailable = (event) => this.audioChunks.push(event.data);

      // Handle recording stop
      return new Promise((resolve, reject) => {
        this.mediaRecorder.onstop = async () => {
          if (this.isCanceled) {
            resolve(null);
          } else {
            this.stopListening();
            this.isRecording.next('Processing');
            const response = await this.sendAudioToBackend();
            this.isRecording.next('Completed');
            resolve(response);
          }
        };

        this.mediaRecorder.start();
        // Start silence detection
        // this.detectSilence();
        setTimeout(() => {
          if (this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
          }
        }, 3000); // Adjust timeout duration as needed
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      this.isRecording.next('Error');
      throw error;
    }
  }  

  private detectSilence() {
    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.analyser = this.audioContext.createAnalyser();
    source.connect(this.analyser);
    this.analyser.fftSize = 512;
  
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
  
    let silenceDetected = false;
    
    const silenceCheckInterval = setInterval(() => {
      this.analyser.getByteFrequencyData(dataArray);
      const volume = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
  
      // If the volume is very low (silence), start or reset the timer
      if (volume < 10) {
        if (!silenceDetected) {
          silenceDetected = true;          
          this.silenceTimer = setTimeout(() => {
            if (this.mediaRecorder.state !== 'inactive') {
              this.mediaRecorder.stop();
            }
          }, 2000); // Stop after 2 seconds of silence
        }
      } else {
        // Reset the timer if speech is detected
        if (silenceDetected) {
          clearTimeout(this.silenceTimer);
          silenceDetected = false;
        }
      }
    }, 50);
  }

  /** Stop microphone stream */
  stopListening() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
    }
    // if (this.audioContext?.state !== 'closed') {
    //   this.audioContext.close();
    // }
  }

  /** Send recorded audio to backend */
  private async sendAudioToBackend(): Promise<any> {
    try {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
      const formData = new FormData();
      formData.append('file', audioBlob, 'speech.wav');
      return await firstValueFrom(
        this.http.post('http://localhost:3000/api/voice-recognize/upload', formData)
      );
    } catch (error) {
      console.error('Error sending audio:', error);
      throw error;
    }
  }

  public cancelListening() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => {
        return track.stop()
      });
    }
    // if (this.audioContext?.state && this.audioContext?.state !== 'closed') {
    //   this.audioContext.close();
    // }
    this.isCanceled = true;
    this.isRecording.next('Closed');
  }
}
