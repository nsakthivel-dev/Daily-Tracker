// Sound manager for game-like audio effects
class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  
  constructor() {
    if (typeof window !== "undefined") {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.loadSounds();
    }
  }
  
  private async loadSounds() {
    if (!this.audioContext) return;
    
    try {
      // Create simple sound effects programmatically
      this.createClickSound();
      this.createCompleteSound();
      this.createErrorSound();
      this.createLevelUpSound();
    } catch (error) {
      console.warn("Failed to initialize sound effects:", error);
    }
  }
  
  private createClickSound() {
    if (!this.audioContext) return;
    
    const duration = 0.1;
    const sampleRate = this.audioContext.sampleRate;
    const length = Math.ceil(duration * sampleRate);
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    // Simple click sound
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      data[i] = Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 20);
    }
    
    this.sounds.set("click", buffer);
  }
  
  private createCompleteSound() {
    if (!this.audioContext) return;
    
    const duration = 0.5;
    const sampleRate = this.audioContext.sampleRate;
    const length = Math.ceil(duration * sampleRate);
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    // Upward arpeggio sound for completion
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const frequency = 440 + 220 * (t / duration);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 3);
    }
    
    this.sounds.set("complete", buffer);
  }
  
  private createErrorSound() {
    if (!this.audioContext) return;
    
    const duration = 0.3;
    const sampleRate = this.audioContext.sampleRate;
    const length = Math.ceil(duration * sampleRate);
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    // Downward tone for errors
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const frequency = 220 - 110 * (t / duration);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 5);
    }
    
    this.sounds.set("error", buffer);
  }
  
  private createLevelUpSound() {
    if (!this.audioContext) return;
    
    const duration = 1.0;
    const sampleRate = this.audioContext.sampleRate;
    const length = Math.ceil(duration * sampleRate);
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    // Celebration sound for level up
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const frequency = 523.25 + 100 * Math.sin(2 * Math.PI * 8 * t);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 2);
    }
    
    this.sounds.set("levelUp", buffer);
  }
  
  private lastSoundTime: number = 0;
  private soundCooldown: number = 50; // 50ms cooldown between sounds
  
  public playSound(soundName: string) {
    if (!this.audioContext || this.audioContext.state === "suspended") return;
    
    const now = Date.now();
    if (now - this.lastSoundTime < this.soundCooldown) {
      return; // Skip sound if too soon since last sound
    }
    
    const buffer = this.sounds.get(soundName);
    if (!buffer) return;
    
    this.lastSoundTime = now;
    
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start();
    
    // Clean up source after playback
    source.onended = () => {
      source.disconnect();
    };
  }
  
  public async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
  }
}

// Singleton instance
export const soundManager = new SoundManager();