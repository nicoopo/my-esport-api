'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
    { href: '/matches', label: 'Matchs' },
    { href: '/matches?status=running', label: 'Live' },
]

export default function Navbar() {
    const pathname = usePathname()

    return (
        <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0d0f14]/80 backdrop-blur-md">
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="w-6 h-6 rounded bg-violet-500 flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <circle cx="7" cy="7" r="5" stroke="white" strokeWidth="1.5"/>
                            <path d="M7 4v3l2 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    </span>
                    <span className="font-bold text-white text-sm tracking-tight">
                        EsportTracker
                    </span>
                </Link>

                {/* Nav */}
                <nav className="flex items-center gap-1">
                    {NAV_LINKS.map(({ href, label }) => {
                        const active = pathname === href.split('?')[0]
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    active
                                        ? 'bg-white/10 text-white'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {label === 'Live' ? (
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        {label}
                                    </span>
                                ) : label}
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </header>
    )
}
