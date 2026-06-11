import { Match } from '@/types/match'
import Link from 'next/link'

async function fetchMatches(type: 'upcoming' | 'running' | 'past'): Promise<Match[]> {
    const res = await fetch(
        `${process.env.SYMFONY_API_URL}/api/matches/${type}?per_page=100`,
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
    s: 'text-yellow-400',
    a: 'text-purple-400',
    b: 'text-blue-400',
    c: 'text-slate-300',
    d: 'text-slate-500',
}

function StatCard({ label, value, sub, color }: {
    label: string
    value: number
    sub?: string
    color: string
}) {
    return (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] px-5 py-4">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-3xl font-bold tabular-nums ${color}`}>{value}</p>
            {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
        </div>
    )
}

function MatchRow({ match }: { match: Match }) {
    const [t1, t2]  = match.opponents ?? []
    const gameName  = match.videogame?.name ?? ''
    const badge     = GAME_BADGE[gameName] ?? 'bg-slate-700/50 text-slate-400'
    const tierColor = TIER_COLORS[match.tournament?.tier ?? 'd'] ?? 'text-slate-500'

    return (
        <Link
            href={`/matches/${match.id}`}
            target="_blank"
            className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-4 py-3
                       border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors"
        >
            {/* Équipes */}
            <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm text-white font-medium truncate">
                    {t1?.opponent?.acronym ?? t1?.opponent?.name ?? 'TBD'}
                </span>
                <span className="text-slate-600 text-xs shrink-0">vs</span>
                <span className="text-sm text-white font-medium truncate">
                    {t2?.opponent?.acronym ?? t2?.opponent?.name ?? 'TBD'}
                </span>
            </div>

            {/* Jeu */}
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${badge}`}>
                {gameName}
            </span>

            {/* Tier */}
            <span className={`text-xs font-bold uppercase shrink-0 ${tierColor}`}>
                {match.tournament?.tier?.toUpperCase() ?? 'D'}
            </span>

            {/* Date */}
            <span className="text-xs text-slate-500 shrink-0 text-right">
                {formatDate(match.scheduled_at ?? match.begin_at)}
            </span>
        </Link>
    )
}

export default async function AdminDashboard() {
    const [upcoming, running, past] = await Promise.all([
        fetchMatches('upcoming'),
        fetchMatches('running'),
        fetchMatches('past'),
    ])

    // Stats par jeu
    const gameCount = [...upcoming, ...running].reduce<Record<string, number>>((acc, m) => {
        const g = m.videogame?.name ?? 'Inconnu'
        acc[g] = (acc[g] ?? 0) + 1
        return acc
    }, {})

    // Stats par tier
    const tierCount = upcoming.reduce<Record<string, number>>((acc, m) => {
        const t = m.tournament?.tier ?? 'd'
        acc[t] = (acc[t] ?? 0) + 1
        return acc
    }, {})

    const recentPast    = past.slice(0, 5)
    const nextUpcoming  = upcoming.slice(0, 8)

    return (
        <div className="p-8 space-y-8 max-w-5xl">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-500 text-sm mt-1">Vue d'ensemble des matchs en temps réel</p>
            </div>

            {/* Stats principales */}
            <div className="grid grid-cols-3 gap-4">
                <StatCard
                    label="Matchs à venir"
                    value={upcoming.length}
                    sub="prochaines 24h"
                    color="text-white"
                />
                <StatCard
                    label="En cours"
                    value={running.length}
                    sub="live maintenant"
                    color="text-green-400"
                />
                <StatCard
                    label="Terminés"
                    value={past.length}
                    sub="dernières 24h"
                    color="text-slate-400"
                />
            </div>

            {/* Répartition par jeu */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                    Répartition par jeu
                </h2>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(gameCount)
                        .sort((a, b) => b[1] - a[1])
                        .map(([game, count]) => (
                            <div
                                key={game}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
                                            ${GAME_BADGE[game] ?? 'bg-slate-700/50 text-slate-400'}`}
                            >
                                <span className="font-semibold">{game}</span>
                                <span className="opacity-60 text-xs">{count}</span>
                            </div>
                        ))
                    }
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">

                {/* Prochains matchs */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Prochains matchs
                        </h2>
                        <Link href="/admin/matches" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
                            Voir tout →
                        </Link>
                    </div>
                    <div>
                        {nextUpcoming.length === 0 ? (
                            <p className="text-slate-600 text-sm px-4 py-6">Aucun match à venir</p>
                        ) : (
                            nextUpcoming.map(m => <MatchRow key={m.id} match={m} />)
                        )}
                    </div>
                </div>

                {/* Matchs récents */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5">
                        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Récemment terminés
                        </h2>
                    </div>
                    <div>
                        {recentPast.length === 0 ? (
                            <p className="text-slate-600 text-sm px-4 py-6">Aucun match récent</p>
                        ) : (
                            recentPast.map(m => <MatchRow key={m.id} match={m} />)
                        )}
                    </div>
                </div>
            </div>

            {/* Répartition par tier */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                    Matchs à venir par tier
                </h2>
                <div className="flex items-end gap-4">
                    {['s', 'a', 'b', 'c', 'd'].map(tier => {
                        const count = tierCount[tier] ?? 0
                        const max   = Math.max(...Object.values(tierCount), 1)
                        const h     = Math.max((count / max) * 80, count > 0 ? 8 : 0)
                        return (
                            <div key={tier} className="flex flex-col items-center gap-1.5">
                                <span className="text-xs text-slate-500">{count}</span>
                                <div
                                    className={`w-8 rounded-t ${TIER_COLORS[tier]} bg-current opacity-30`}
                                    style={{ height: `${h}px` }}
                                />
                                <span className={`text-xs font-bold uppercase ${TIER_COLORS[tier]}`}>
                                    {tier}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
