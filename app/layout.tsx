import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CivicConnect // Verified Events, AI Crowd Safety & Resilient Mesh',
  description:
    'A bespoke civic-tech platform for verified public events, computer-vision crowd safety, and resilient communication.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-[#F4F1EA] text-[#14141C]">
        {children}
      </body>
    </html>
  );
}
