import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SUITE_CRM CORE",
  description: "Advanced SuiteCRM & Postgres Sync System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        {/* TOP NAVIGATION BAR */}
        <nav className="border-b border-gray-800 bg-[#050505] sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="font-bold tracking-tighter text-xl">
              SUITE<span className="text-blue-500">_CRM</span>
            </div>
            
            <div className="flex gap-8">
              <Link 
                href="/" 
                className="text-[10px] font-bold uppercase tracking-widest hover:text-blue-500 transition-colors"
              >
                Contacts
              </Link>
              <Link 
                href="/users" 
                className="text-[10px] font-bold uppercase tracking-widest hover:text-blue-500 transition-colors"
              >
                Users
              </Link>
              <Link 
                href="/admin" 
                className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors border border-red-900/50 px-3 py-1 rounded-sm bg-red-950/20"
              >
                Admin Sync
              </Link>
            </div>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}