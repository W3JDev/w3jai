import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Automatically clean up after each test
afterEach(() => {
  cleanup();
});

// Mock the IntersectionObserver
class IntersectionObserverMock {
  constructor(callback) {
    this.callback = callback;
    this.elements = new Set();
    this.observedEntries = [];
  }

  observe(element) {
    this.elements.add(element);
    this.observedEntries.push({
      target: element,
      isIntersecting: true,
    });

    this.callback(this.observedEntries, this);
  }

  unobserve(element) {
    this.elements.delete(element);
    this.observedEntries = this.observedEntries.filter(
      (entry) => entry.target !== element
    );
  }

  disconnect() {
    this.elements.clear();
    this.observedEntries = [];
  }
}

// Mock the ResizeObserver
class ResizeObserverMock {
  constructor(callback) {
    this.callback = callback;
    this.elements = new Set();
  }

  observe(element) {
    this.elements.add(element);
  }

  unobserve(element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
  }
}

// Mock the SpeechRecognition API
class SpeechRecognitionMock {
  constructor() {
    this.continuous = false;
    this.interimResults = false;
    this.lang = 'en-US';
    this.onresult = null;
    this.onerror = null;
    this.onend = null;
  }

  start() {
    // Simulate starting recognition
  }

  stop() {
    // Simulate stopping recognition
    if (this.onend) {
      this.onend();
    }
  }
}

// Mock the Web Audio API
class AudioContextMock {
  constructor() {
    this.state = 'running';
    this.destination = {};
  }

  createMediaStreamSource() {
    return {
      connect: () => {},
    };
  }

  createAnalyser() {
    return {
      connect: () => {},
      disconnect: () => {},
      fftSize: 0,
      getByteFrequencyData: () => {},
    };
  }

  resume() {
    return Promise.resolve();
  }

  close() {
    return Promise.resolve();
  }
}

// Set up global mocks
global.IntersectionObserver = IntersectionObserverMock;
global.ResizeObserver = ResizeObserverMock;
global.SpeechRecognition = SpeechRecognitionMock;
global.webkitSpeechRecognition = SpeechRecognitionMock;
global.AudioContext = AudioContextMock;
global.webkitAudioContext = AudioContextMock;

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
