import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SUITE_CRM CORE",
  description: "External Contact Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        {/* TOP NAVIGATION BAR */}
        <nav className="border-b border-gray-900 bg-black sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
            
            {/* LOGO: MATCHES SCREENSHOT */}
            <div className="font-bold text-2xl tracking-tighter italic uppercase">
              SUITE<span className="text-purple-600">_CRM</span>
            </div>

            {/* NAV LINKS & ADMIN BUTTON */}
            <div className="flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.2em]">
              <Link href="/" className="hover:text-purple-500 transition-colors">
                Contacts
              </Link>
              <Link href="/users" className="hover:text-purple-500 transition-colors">
                Users
              </Link>
              
              {/* ADMIN SYNC BUTTON: MATCHES RED OUTLINE STYLE */}
              <Link 
                href="/admin" 
                className="border border-red-900/60 text-red-600 px-5 py-2 rounded-sm bg-red-950/10 hover:bg-red-900/20 transition-all"
              >
                Admin Sync
              </Link>
            </div>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}