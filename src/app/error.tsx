'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong!
            </h1>
          </div>
            <p className="text-gray-600 mb-6">
            We&apos;re sorry, but something unexpected happened. 
            {process.env.NODE_ENV === 'development' && (
              <span className="block mt-2 text-sm text-red-600 font-mono">
                {error.message}
              </span>
            )}
          </p>
          
          <div className="space-y-3">            <button
              onClick={reset}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try again</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}