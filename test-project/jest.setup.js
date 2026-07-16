import '@testing-library/jest-dom';

class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe = jest.fn(element => {
    // Immediately report as visible so view tracking can fire in tests
    this.callback?.(
      [
        {
          isIntersecting: true,
          target: element,
        },
      ],
      this,
    );
  });
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});
