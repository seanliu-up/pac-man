export class AudioManager {
  constructor({ initialMuted = false, onMuteToggle } = {}) {
    this._muted = initialMuted;
    this._onMuteToggle = onMuteToggle;
    this._ctx = null;
    this._buffers = {};
    this._ready = false;
    this._initContext();
  }

  _initContext() {
    try {
      this._ctx = new AudioContext();
      if (this._muted) this._ctx.suspend();
      this._ready = true;
    } catch {
      this._ready = false;
    }
  }

  preload(soundId, url) {
    if (!this._ready) return;
    fetch(url)
      .then(r => r.arrayBuffer())
      .then(buf => this._ctx.decodeAudioData(buf))
      .then(decoded => { this._buffers[soundId] = decoded; })
      .catch(() => {});
  }

  play(soundId) {
    if (!this._ready || this._muted) return;
    const buf = this._buffers[soundId];
    if (!buf) return;
    const src = this._ctx.createBufferSource();
    src.buffer = buf;
    src.connect(this._ctx.destination);
    src.start();
  }

  setMuted(muted) {
    this._muted = muted;
    if (!this._ready) return;
    if (muted) {
      this._ctx.suspend();
    } else {
      this._ctx.resume();
    }
    this._onMuteToggle?.(muted);
  }

  toggle() { this.setMuted(!this._muted); }
  get muted() { return this._muted; }
}
