import { Link } from "wouter";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-white selection:text-black">
      <header className="border-b-4 border-white sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black uppercase tracking-tighter hover:opacity-80 transition-opacity">
            POST
          </Link>
          <Link 
            href="/create" 
            className="border-2 border-white px-5 py-2 bg-white text-black font-bold uppercase text-sm hover:bg-[#0a0a0a] hover:text-white transition-colors duration-200"
          >
            Create
          </Link>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
