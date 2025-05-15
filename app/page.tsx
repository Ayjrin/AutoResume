import { FileUploaderDemo } from "@/features/file-uploader/components/FileUploaderDemo";

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)] flex flex-col">
      <header className="text-center pt-10 pb-16">
        <h1 className="text-3xl font-bold mb-1">Resume LaTeX-er</h1>
        <p className="text-sm font-light text-gray-600 dark:text-gray-400">
          LaTeX... it&apos;s just better.
        </p>
      </header>
      <main className="flex flex-col w-full max-w-4xl mx-auto flex-1">
        <div className="w-full mx-auto bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md">
          <FileUploaderDemo />
        </div>
      </main>
      
      <footer className="w-full py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          <a href="https://github.com/Ayjrin/LaTeX-er">MIT License</a>
        </p>
        <p>
          <a href="https://github.com/Ayjrin/LaTeX-er">GitHub</a> | <a href="https://bsky.app/profile/ayjrin.bsky.social">Bluesky</a>
        </p>
      </footer>
    </div>
  );
}
