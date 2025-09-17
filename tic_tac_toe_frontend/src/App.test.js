import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app header title', () => {
  render(<App />);
  const title = screen.getByText(/Ocean Tic Tac Toe/i);
  expect(title).toBeInTheDocument();
});

test('renders options panel', () => {
  render(<App />);
  const options = screen.getByText(/Options/i);
  expect(options).toBeInTheDocument();
});
