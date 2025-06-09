'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const createNewNote = async () => {
    setIsCreating(true);
    const noteId = 'noteno' + Math.random().toString(36).substring(2, 8);
    router.push(`/${noteId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">NoteKeeper</h1>
            </div>
            <button
              onClick={createNewNote}
              disabled={isCreating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'New Note'}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Share Notes Instantly
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Create and share collaborative notes with custom URLs.
          </p>
          <button
            onClick={createNewNote}
            disabled={isCreating}
            className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isCreating ? 'Creating Note...' : 'Create Your First Note'}
          </button>
        </div>
      </main>
    </div>
  );
}
