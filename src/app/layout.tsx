import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NextJS Todo',
  description: 'Aplicación de tareas con NextJS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}