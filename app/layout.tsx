import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Smart Home Dashboard',
  description: 'Realtime IoT data from OhStem',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}