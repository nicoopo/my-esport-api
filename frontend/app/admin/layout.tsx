import Link from 'next/link'

const SIDEBAR_LINKS = [
    { href: '/admin',          label: 'Dashboard',  icon: '▦' },
    { href: '/admin/matches',  label: 'Matchs',     icon: '⚔' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-[calc(100vh-56px)]">

            {/* Sidebar */}
            <aside className="w-52 shrink-0 border-r border-white/5 bg-white/[0.02] px-3 py-6">
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-3">
                    Admin
                </p>
                <nav className="flex flex-col gap-0.5">
                    {SIDEBAR_LINKS.map(({ href, label, icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                                       text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            <span className="text-base">{icon}</span>
                            {label}
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-white/5 mt-6">
                    <Link
                        href="/matches"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                                   text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        <span>←</span> Vue publique
                    </Link>
                </div>
            </aside>

            {/* Contenu */}
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div>
    )
}
