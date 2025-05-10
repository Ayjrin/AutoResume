'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
      <p className="text-xl mb-8">
        An unexpected error occurred. Please try again or contact support.
      </p>
      
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700 transition-colors"
      >
        Try again
      </button>
      
      <div className="mt-16 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg max-w-lg">
        <h2 className="text-lg font-semibold mb-2">Error Details</h2>
        <p className="text-sm mb-2 text-red-600 dark:text-red-400">
          {error.message || 'Unknown error'}
        </p>
        {error.digest && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
