import { Printer } from "lucide-react"
import Link from "next/link"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Printer className="h-6 w-6 text-primary-blue" />
          <span className="font-bold tracking-tight text-ink">PRINT MACHINE</span>
        </Link>
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5 text-xs font-medium text-success">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
            </span>
            <span>Station Online</span>
          </span>
        </div>
      </div>
    </header>
  )
}
