import { AudioServiceInterface } from '../types/tea.types';

export class AudioService implements AudioServiceInterface {
    private audio: HTMLAudioElement | null = null;
    
    constructor(audioPath: string = 'pour.mp3') {
        this.audio = new Audio(audioPath);
        this.audio.volume = 0.5;
    }
    
    playPourSound(): void {
        if (this.audio) {
            this.audio.currentTime = 0;
            this.audio.play().catch(() => {
                // Подавляем ошибки автоплея
                console.log('Audio play failed, user interaction may be required');
            });
        }
    }
}