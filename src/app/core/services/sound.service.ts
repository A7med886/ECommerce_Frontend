import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SoundService {

  private soundSubject = new Subject<string>();

  constructor() {
    this.soundSubject
      .pipe(throttleTime(5000))
      .subscribe(src => this.playSound(src));
  }

  playNotification() {
    this.soundSubject.next('sounds/notification.mp3');
  }

  playError() {
    this.soundSubject.next('sounds/error.mp3');
  }

  private playSound(src: string) {
    const audio = new Audio(src);
    audio.play().catch(() => {});
  }
}

// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class SoundService {

//   private notificationAudio = new Audio('sounds/notification.mp3');
//   private errorAudio = new Audio('sounds/error.mp3');

//   private isEnabled = true;

//   private lastPlayed = 0;
//   private cooldown = 5000; // 5 seconds

//   constructor() {
//     this.notificationAudio.load();
//     this.errorAudio.load();
//   }

//   enable() {
//     this.isEnabled = true;
//   }

//   disable() {
//     this.isEnabled = false;
//   }

//   playNotification() {
//     if (!this.isEnabled) return;
//     this.play(this.notificationAudio);
//   }

//   playError() {
//     if (!this.isEnabled) return;
//     this.play(this.errorAudio);
//   }

//   private play(audio: HTMLAudioElement) {
//     const now = Date.now();

//     // If played recently, skip
//     if (now - this.lastPlayed < this.cooldown) {
//       return;
//     }

//     this.lastPlayed = now;

//     audio.pause();
//     audio.currentTime = 0; // restart if already playing

//     audio.play().catch(err => {
//       console.warn('Audio blocked by browser:', err);
//     });
//   }
// }