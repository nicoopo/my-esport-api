import { Match } from '@/types/match'
import Link from 'next/link'

async function fetchMatches(type: 'upcoming' | 'running' | 'past', game?: string): Promise<Match[]> {
    const params = new URLSearchParams({ per_page: '50' })
    if (game) params.set('game', game)

    const res = await fetch(
        `${process.env.SYMFONY_API_URL}/api/matches/${type}?${params}`,
        { cache: 'no-store' }
    )
    if (!res.ok) return []
    const json = await res.json()
    return json.data ?? []
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('fr-FR', {
        day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit',
    })
}

const GAME_BADGE: Record<string, string> = {
    'LoL':             'bg-yellow-500/20 text-yellow-300',
    'Counter-Strike':  'bg-orange-500/20 text-orange-300',
    'Valorant':        'bg-pink-500/20 text-pink-300',
    'Dota 2':          'bg-red-500/20 text-red-300',
    'Rainbow 6 Siege': 'bg-blue-500/20 text-blue-300',
    'Rocket League':   'bg-sky-500/20 text-sky-300',
}

const TIER_COLORS: Record<string, string> = {
    s: 'text-yellow-400 bg-yellow-500/10',
    a: 'text-purple-400 bg-purple-500/10',
    b: 'text-blue-400 bg-blue-500/10',
    c: 'text-slate-300 bg-slate-500/10',
    d: 'text-slate-500 bg-slate-700/10',
}

const STATUS_TABS = [
    { key: 'upcoming', label: 'À venir' },
    { key: 'running',  label: 'En cours' },
    { key: 'past',     label: 'Terminés' },
] as const

const GAMES = [
    { slug: '',         label: 'Tous' },
    { slug: 'lol',      label: 'LoL' },
    { slug: 'csgo',     label: 'CS2' },
    { slug: 'valorant', label: 'Valorant' },
    { slug: 'dota2',    label: 'Dota 2' },
    { slug: 'r6siege',  label: 'R6' },
    { slug: 'rl',       label: 'Rocket League' },
]

export default async function AdminMatchesPage({
                                                   searchParams,
                                               }: {
    searchParams: Promise<{ status?: string; game?: string }>
}) {
    const { status = 'upcoming', game } = await searchParams
    const validStatus = ['upcoming', 'running', 'past'].includes(status)
        ? (status as 'upcoming' | 'running' | 'past')
        : 'upcoming'

    const matches = await fetchMatches(validStatus, game)

    return (
        <div className="p-8 space-y-6 max-w-5xl">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Matchs</h1>
                    <p className="text-slate-500 text-sm mt-1">{matches.length} résultats</p>
                </div>
            </div>

            {/* Tabs statut */}
            <div className="flex items-center gap-1 border-b border-white/5 pb-0">
                {STATUS_TABS.map(({ key, label }) => (
                    <a
                        key={key}
                        href={`/admin/matches?status=${key}${game ? `&game=${game}` : ''}`}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                            validStatus === key
                                ? 'border-violet-500 text-white'
                                : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        {label}
                    </a>
                ))}
            </div>

            {/* Filtres jeu */}
            <div className="flex flex-wrap gap-2">
                {GAMES.map(({ slug, label }) => (
                    <a
                        key={slug}
                        href={`/admin/matches?status=${validStatus}${slug ? `&game=${slug}` : ''}`}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            (game ?? '') === slug
                                ? 'border-white/20 bg-white/10 text-white'
                                : 'border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                        }`}
                    >
                        {label}
                    </a>
                ))}
            </div>

            {/* Tableau */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">

                {/* En-tête tableau */}
                <div className="grid grid-cols-[2fr_1fr_1fr_auto_auto_auto] gap-4 px-4 py-2.5
                                border-b border-white/5 bg-white/[0.02]">
                    <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Équipes</span>
                    <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Ligue</span>
                    <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Jeu</span>
                    <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Tier</span>
                    <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Format</span>
                    <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider text-right">Date</span>
                </div>

                {/* Lignes */}
                {matches.length === 0 ? (
                    <div className="px-4 py-16 text-center text-slate-600 text-sm">
                        Aucun match pour cette sélection.
                    </div>
                ) : (
                    matches.map(match => {
                        const [t1, t2]  = match.opponents ?? []
                        const gameName  = match.videogame?.name ?? ''
                        const tier      = match.tournament?.tier ?? 'd'
                        const isLive    = match.status === 'running'

                        return (
                            <Link
                                key={match.id}
                                href={`/matches/${match.id}`}
                                target="_blank"
                                className="grid grid-cols-[2fr_1fr_1fr_auto_auto_auto] gap-4 items-center
                                           px-4 py-3 border-b border-white/[0.04] last:border-0
                                           hover:bg-white/[0.03] transition-colors group"
                            >
                                {/* Équipes */}
                                <div className="flex items-center gap-2 min-w-0">
                                    {isLive && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
                                    )}
                                    <span className="text-sm text-white font-medium truncate">
                                        {t1?.opponent?.acronym ?? t1?.opponent?.name ?? 'TBD'}
                                    </span>
                                    <span className="text-slate-600 text-xs shrink-0">vs</span>
                                    <span className="text-sm text-white font-medium truncate">
                                        {t2?.opponent?.acronym ?? t2?.opponent?.name ?? 'TBD'}
                                    </span>
                                    {match.rescheduled && (
                                        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">
                                            resch.
                                        </span>
                                    )}
                                </div>

                                {/* Ligue */}
                                <span className="text-xs text-slate-500 truncate">
                                    {match.league?.name ?? '—'}
                                </span>

                                {/* Jeu */}
                                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full w-fit
                                                  ${GAME_BADGE[gameName] ?? 'bg-slate-700/50 text-slate-400'}`}>
                                    {gameName || '—'}
                                </span>

                                {/* Tier */}
                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded
                                                  ${TIER_COLORS[tier]}`}>
                                    {tier.toUpperCase()}
                                </span>

                                {/* Format */}
                                <span className="text-xs text-slate-500">
                                    BO{match.number_of_games}
                                </span>

                                {/* Date */}
                                <span className="text-xs text-slate-500 text-right">
                                    {formatDate(match.scheduled_at ?? match.begin_at)}
                                </span>
                            </Link>
                        )
                    })
                )}
            </div>
        </div>
    )
}
