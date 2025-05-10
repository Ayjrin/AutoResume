import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider, ThemeToggle } from "@/shared/components/theme";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Resume Formatter - LaTeX... it's just better.",
  description: "Convert your resume to professional LaTeX format",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 transition-colors`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
