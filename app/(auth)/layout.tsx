import Link from "next/link"
import Image from "next/image"

/** Minimal header for auth pages — no Radix components, no hydration mismatch */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 z-50 w-full border-b border-border bg-white/90 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/imgs/template/workfitai.png"
              alt="WorkfitAI logo"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              priority
            />
            <span className="text-xl font-bold text-[#1a2140]">WorkfitAI</span>
          </Link>
        </div>
      </header>
      <main className="relative overflow-hidden pt-16">
        {children}
      </main>
    </div>
  )
}
