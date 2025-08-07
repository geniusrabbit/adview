import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

describe('Basic Test', () => {
  it('should render a basic test component', () => {
    const TestComponent = () => <div>Test Component</div>;
    render(<TestComponent />);
    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });
});
