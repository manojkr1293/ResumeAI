'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, FileQuestion } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-secondary-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="container max-w-lg text-center"
      >
        <div className="mb-6 inline-flex rounded-2xl bg-primary-500/10 p-5">
          <FileQuestion className="h-12 w-12 text-primary-400" />
        </div>

        <h1 className="mb-3 text-6xl font-extrabold tracking-tight">
          <span className="gradient-text">404</span>
        </h1>

        <h2 className="mb-4 text-2xl font-bold tracking-tight">
          Page Not Found
        </h2>

        <p className="mb-8 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 px-6 py-3 text-sm font-semibold text-white shadow-glow-sm transition-all duration-300 hover:shadow-glow-md hover:brightness-110"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>
      </motion.div>
    </main>
  );
}
