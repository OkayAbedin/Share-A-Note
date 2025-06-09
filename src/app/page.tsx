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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Share-A-Note</h1>
            </div>
            <button
              onClick={createNewNote}
              disabled={isCreating}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isCreating ? 'Creating...' : 'New Note'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Share Notes
            <span className="text-blue-600"> Instantly</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Create and share collaborative notes with custom URLs. No account required. 
            Perfect for quick sharing, team collaboration, and anonymous note-taking.
          </p>

          {/* CTA Button */}
          <button
            onClick={createNewNote}
            disabled={isCreating}
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            <Plus className="h-5 w-5 mr-2" />
            {isCreating ? 'Creating Note...' : 'Create Your First Note'}
          </button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Custom URLs
            </h3>
            <p className="text-gray-600">
              Get shareable links like shareanote.vercel.app/noteno123 that anyone can access instantly
            </p>
          </div>

          <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Real-time Collaboration
            </h3>
            <p className="text-gray-600">
              Multiple people can edit the same note simultaneously with live updates
            </p>
          </div>

          <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Registration
            </h3>
            <p className="text-gray-600">
              Start writing immediately. No accounts, no passwords, no barriers
            </p>
          </div>
        </div>

        {/* Demo URL Example */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">Example URL:</p>
          <div className="inline-block bg-gray-100 px-6 py-3 rounded-lg font-mono text-gray-800">
            https://shareanote.vercel.app/noteno01
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>Built with Next.js 14, Firebase, and Tailwind CSS</p>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4">
                <Link 
                  href="/test" 
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  🔧 Debug Firebase Connection
                </Link>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
