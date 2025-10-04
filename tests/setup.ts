/**
 * Jest Test Setup
 */

// Mock WebAssembly for testing
global.WebAssembly = {
  instantiate: jest.fn(),
  instantiateStreaming: jest.fn(),
  compile: jest.fn(),
  compileStreaming: jest.fn(),
  validate: jest.fn(),
  Module: jest.fn(),
  Instance: jest.fn(),
  Memory: jest.fn(),
  Table: jest.fn(),
  CompileError: Error,
  RuntimeError: Error,
  LinkError: Error,
} as any;

// Mock canvas for Node.js testing
jest.mock('canvas', () => ({
  createCanvas: jest.fn(() => ({
    width: 800,
    height: 600,
    getContext: jest.fn(() => ({
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      scale: jest.fn(),
      fillStyle: '',
    })),
    toBuffer: jest.fn(() => Buffer.from('mock-image-data')),
  })),
}));

// Set up test environment
beforeEach(() => {
  jest.clearAllMocks();
});
