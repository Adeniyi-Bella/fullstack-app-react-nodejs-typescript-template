import { createFileRoute } from '@tanstack/react-router';
import { Register } from '@pages/Register/Register';

export const Route = createFileRoute('/register')({
  component: Register,
});