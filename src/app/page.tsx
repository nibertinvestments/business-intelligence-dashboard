import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to dashboard as specified in next.config.js
  redirect('/dashboard');
}