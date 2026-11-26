/**
 * MSE player with injectable MediaSource / SourceBuffer fakes.
 */

const { createMsePlayer, detectMseSupport } = require('../../src');
const { readFileSync } = require('fs');
const { join } = require('path');

const fmp4Fixture = readFileSync(join(__dirname, '../fixtures/fmp4-fragments.bin'));

function createFakeMse() {
  /** @type {FakeMediaSource | null} */
  let lastInstance = null;

  class FakeSourceBuffer {
    constructor() {
      this.updating = false;
      this.mode = 'segments';
      this.buffered = {
        length: 0,
        start: () => 0,
        end: () => 2
      };
      this._listeners = {};
    }

    addEventListener(evt, fn) {
      this._listeners[evt] = fn;
    }

    appendBuffer(data) {
      this.updating = true;
      this._last = data;
      this.updating = false;
      if (this._listeners.updateend) {
        this._listeners.updateend();
      }
    }

    remove() {}
  }

  class FakeMediaSource {
    static isTypeSupported() {
      return true;
    }

    constructor() {
      this.readyState = 'closed';
      this._open = null;
      lastInstance = this;
    }

    addEventListener(evt, fn) {
      if (evt === 'sourceopen') {
        this._open = fn;
      }
    }

    addSourceBuffer() {
      return new FakeSourceBuffer();
    }

    endOfStream() {
      this.readyState = 'ended';
    }

    open() {
      this.readyState = 'open';
      if (this._open) {
        this._open();
      }
    }
  }

  FakeMediaSource.last = () => lastInstance;
  return FakeMediaSource;
}

describe('createMsePlayer', () => {
  beforeAll(() => {
    if (typeof globalThis.URL === 'undefined') {
      globalThis.URL = {
        createObjectURL: () => 'blob:fake',
        revokeObjectURL: () => {}
      };
    }
  });

  test('detectMseSupport reports missing APIs in Node', () => {
    const support = detectMseSupport({});
    expect(support.supported).toBe(false);
  });

  test('appends init keyframe from parseFmp4Fragments path', async () => {
    const MediaSource = createFakeMse();
    const video = {
      src: '',
      muted: false,
      playsInline: false,
      play: async () => {},
      removeAttribute() {}
    };
    const player = createMsePlayer({
      videoElement: video,
      MediaSource,
      mimeType: 'video/mp4; codecs="avc1.42E01E"',
      createObjectURL: () => 'blob:unit-test'
    });
    const fakeMs = MediaSource.last();
    expect(fakeMs).not.toBeNull();
    fakeMs.open();
    await player.appendFragment(new Uint8Array(fmp4Fixture));
    expect(player.waitingForKeyframe).toBe(false);
    player.close();
  });
});