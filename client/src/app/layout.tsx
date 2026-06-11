import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';

import './globals.css';
import AnalyticsTracker from '@/components/analytics-tracker';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: {
    default: 'ResumeAI — AI-Powered Resume Builder',
    template: '%s | ResumeAI',
  },
  description:
    'Build ATS-optimized, professionally crafted resumes with AI assistance. Get real-time scoring, smart suggestions, and land more interviews.',
  keywords: [
    'resume builder',
    'AI resume',
    'ATS optimization',
    'career tools',
    'job application',
    'resume scoring',
    'professional resume',
    'CV builder',
  ],
  authors: [{ name: 'ResumeAI Team' }],
  creator: 'ResumeAI',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://resumeai.app',
    siteName: 'ResumeAI',
    title: 'ResumeAI — AI-Powered Resume Builder',
    description:
      'Build ATS-optimized, professionally crafted resumes with AI assistance. Get real-time scoring, smart suggestions, and land more interviews.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ResumeAI — AI-Powered Resume Builder',
    description:
      'Build ATS-optimized, professionally crafted resumes with AI assistance.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
