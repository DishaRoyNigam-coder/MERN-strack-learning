// src/components/__tests__/Button.test.jsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../Button';


// ============================================================
// SNAPSHOT TESTS
// ============================================================

describe('Button Snapshot Tests', () => {
  it('matches snapshot for primary variant', () => {
    const { container } = render(
      <Button variant="primary" onClick={() => {}}>
        Click Me
      </Button>
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for secondary variant', () => {
    const { container } = render(
      <Button variant="secondary" onClick={() => {}}>
        Click Me
      </Button>
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for danger variant', () => {
    const { container } = render(
      <Button variant="danger" onClick={() => {}}>
        Delete
      </Button>
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for success variant', () => {
    const { container } = render(
      <Button variant="success" onClick={() => {}}>
        Save
      </Button>
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for small size', () => {
    const { container } = render(
      <Button size="small" onClick={() => {}}>
        Small
      </Button>
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for large size', () => {
    const { container } = render(
      <Button size="large" onClick={() => {}}>
        Large
      </Button>
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot when disabled', () => {
    const { container } = render(
      <Button disabled onClick={() => {}}>
        Disabled
      </Button>
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(
      <Button className="custom-class" onClick={() => {}}>
        Custom Class
      </Button>
    );
    expect(container).toMatchSnapshot();
  });
});

// ============================================================
// BEHAVIOR TESTS
// ============================================================

describe('Button Behavior Tests', () => {
  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick}>
        Click Me
      </Button>
    );

    const button = screen.getByRole('button', { name: /click me/i });
    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        Click Me
      </Button>
    );

    const button = screen.getByRole('button', { name: /click me/i });
    await userEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders with correct text content', () => {
    render(
      <Button variant="primary">
        Test Button
      </Button>
    );

    const button = screen.getByRole('button', { name: /test button/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Test Button');
  });

  it('applies correct variant class', () => {
    render(
      <Button variant="danger">
        Delete
      </Button>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-danger');
  });
});