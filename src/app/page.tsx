'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Plus, Share2, Users, Zap } from 'lucide-react';
import { generateNoteId } from '@/lib/utils';

export default function Home() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const createNewNote = async () => {
    setIsCreating(true);
    const noteId = generateNoteId();
    router.push(`/${noteId}`);
  };
  return (
    <div className="min-h-screen bg-gradient-dark">      {/* Header */}
      <header className="border-b border-zinc-800/50 glass-strong">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <img src="/apple-icon.svg" alt="Share-A-Note" className="h-8 w-8" />
              <h1 className="text-2xl font-bold text-zinc-100">Share-A-Note</h1>
            </Link>
            
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/about" className="text-zinc-300 hover:text-zinc-100 transition-colors">
                  About
                </Link>
                <Link href="/privacy" className="text-zinc-300 hover:text-zinc-100 transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="text-zinc-300 hover:text-zinc-100 transition-colors">
                  Terms
                </Link>
              </nav>
              
              <button
                onClick={createNewNote}
                disabled={isCreating}
                className="inline-flex items-center px-4 py-2 bg-blue-600/90 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 backdrop-blur-sm border border-blue-500/20 disabled:opacity-50 hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? 'Creating...' : 'New Note'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-zinc-100 mb-6">
            Share Notes
            <span className="text-blue-400"> Instantly</span>
          </h2>
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
            Create and share collaborative notes with custom URLs. No account required. 
            Perfect for quick sharing, team collaboration, and anonymous note-taking.
          </p>          {/* CTA Button */}
          <button
            onClick={createNewNote}
            disabled={isCreating}
            className="inline-flex items-center px-8 py-4 bg-blue-600/90 text-white text-lg font-semibold rounded-xl hover:bg-blue-600 transform hover:scale-105 transition-all duration-200 backdrop-blur-sm border border-blue-500/20 shadow-lg shadow-blue-600/10 hover:shadow-xl hover:shadow-blue-600/20 disabled:opacity-50"
          >
            <Plus className="h-5 w-5 mr-2" />
            {isCreating ? 'Creating Note...' : 'Create Your First Note'}
          </button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-8 mt-20">
          <div className="text-center p-4 md:p-6 rounded-xl glass hover:glass-strong transition-all duration-300 group">
            <div className="bg-blue-500/20 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:bg-blue-500/30 transition-colors">
              <Share2 className="h-6 w-6 md:h-8 md:w-8 text-blue-400" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-zinc-100 mb-2">
              Custom URLs
            </h3>
            <p className="text-sm md:text-base text-zinc-400">
              Get shareable links like shareanote.vercel.app/noteno123 that anyone can access instantly
            </p>
          </div>

          <div className="text-center p-4 md:p-6 rounded-xl glass hover:glass-strong transition-all duration-300 group">
            <div className="bg-emerald-500/20 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:bg-emerald-500/30 transition-colors">
              <Users className="h-6 w-6 md:h-8 md:w-8 text-emerald-400" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-zinc-100 mb-2">
              Real-time Collaboration
            </h3>
            <p className="text-sm md:text-base text-zinc-400">
              Multiple people can edit the same note simultaneously with live updates
            </p>
          </div>

          <div className="text-center p-4 md:p-6 rounded-xl glass hover:glass-strong transition-all duration-300 group">
            <div className="bg-purple-500/20 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:bg-purple-500/30 transition-colors">
              <Zap className="h-6 w-6 md:h-8 md:w-8 text-purple-400" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-zinc-100 mb-2">
              No Registration
            </h3>
            <p className="text-sm md:text-base text-zinc-400">
              Start writing immediately. No accounts, no passwords, no barriers
            </p>
          </div>
        </div>        {/* Demo URL Example */}
        <div className="mt-8 text-center">
          <p className="text-zinc-400 mb-4">Example URL:</p>
          <div className="inline-block glass px-6 py-3 rounded-lg font-mono text-zinc-300">
            https://shareanote.vercel.app/yourcustomname
          </div>
        </div>
      </main>      {/* Footer */}
      <footer className="border-t border-zinc-800/50 mt-6">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-zinc-400">
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
              <nav className="flex items-center space-x-6 md:hidden">
                <Link href="/about" className="text-zinc-400 hover:text-zinc-300 transition-colors">
                  About
                </Link>
                <Link href="/privacy" className="text-zinc-400 hover:text-zinc-300 transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="text-zinc-400 hover:text-zinc-300 transition-colors">
                  Terms
                </Link>
              </nav>
              
              <p className="text-sm">
                Made with <span className="text-red-400">❤️</span> by{' '}
                <a 
                  href="https://minhazabedin.vercel.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline transition-colors"
                >
                  Minhaz
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
