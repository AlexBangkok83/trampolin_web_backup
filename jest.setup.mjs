// In jest.setup.mjs
import '@testing-library/jest-dom';

// Mock for Chart.js
if (typeof window.HTMLCanvasElement !== 'undefined') {
  window.HTMLCanvasElement.prototype.getContext = () => null;
}
