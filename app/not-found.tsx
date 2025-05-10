import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-xl mb-8">The page you are looking for does not exist.</p>
      <Link 
        href="/" 
        className="px-6 py-3 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700 transition-colors"
      >
        Return to Home
      </Link>
      
      <div className="mt-16 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg max-w-lg">
        <h2 className="text-lg font-semibold mb-2">Debugging Information</h2>
        <p className="text-sm mb-2">
          If you&apos;re seeing this page unexpectedly during deployment, please check:
        </p>
        <ul className="text-sm text-left list-disc pl-5">
          <li>API routes are configured correctly</li>
          <li>Environment variables are set in Vercel</li>
          <li>Check the <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">/api/health</code> endpoint</li>
          <li>Review server logs in Vercel dashboard</li>
        </ul>
      </div>
    </div>
  );
}
