import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../../src/components/Input';

describe('Input Component', () => {
  it('should render input element', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should accept and display text input', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Enter text" />);

    const input = screen.getByPlaceholderText('Enter text') as HTMLInputElement;
    await user.type(input, 'Hello World');

    expect(input.value).toBe('Hello World');
  });

  it('should support different input types', () => {
    const { rerender } = render(<Input type="email" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');

    rerender(<Input type="number" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'number');
  });

  it('should support date type inputs', () => {
    render(<Input type="date" data-testid="date-input" />);
    expect(screen.getByTestId('date-input')).toHaveAttribute('type', 'date');
  });

  it('should handle disabled state', () => {
    render(<Input disabled data-testid="input" />);
    const input = screen.getByTestId('input');

    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('data-disabled');
  });

  it('should apply custom className', () => {
    render(<Input className="custom-class" data-testid="input" />);
    const wrapper = screen.getByTestId('input').parentElement;

    expect(wrapper).toHaveClass('custom-class');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('should handle onChange event', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();

    render(<Input onChange={handleChange} placeholder="Test" />);
    const input = screen.getByPlaceholderText('Test');

    await user.type(input, 'a');
    expect(handleChange).toHaveBeenCalled();
  });

  it('should handle invalid state', () => {
    render(<Input data-testid="input" invalid />);
    const input = screen.getByTestId('input');

    expect(input).toHaveAttribute('data-invalid');
  });

  it('should support number type with min/max', () => {
    render(
      <Input
        type="number"
        min={0}
        max={100}
        data-testid="number-input"
      />
    );

    const input = screen.getByTestId('number-input');
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '100');
  });

  it('should support required attribute', () => {
    render(<Input required data-testid="input" />);
    expect(screen.getByTestId('input')).toBeRequired();
  });

  it('should support maxLength attribute', () => {
    render(<Input maxLength={10} data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('maxLength', '10');
  });

  it('should support pattern attribute', () => {
    render(<Input pattern="[0-9]*" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('pattern', '[0-9]*');
  });

  it('should support autoComplete attribute', () => {
    render(<Input autoComplete="email" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('autoComplete', 'email');
  });

  it('should support autoFocus attribute', () => {
    render(<Input autoFocus data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveFocus();
  });
});
