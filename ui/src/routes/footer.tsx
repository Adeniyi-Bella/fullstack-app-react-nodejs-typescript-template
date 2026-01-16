import { createFileRoute } from '@tanstack/react-router';
import { Footer } from '@/components/layout/Footer/Footer';

export const Route = createFileRoute('/footer')({
  component: Footer,
});