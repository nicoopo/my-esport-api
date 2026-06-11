import { Match } from '@/types/match'
import Image from 'next/image'
import Link from 'next/link'

async function getUpcomingMatches(game?: string): Promise<Match[]> {
    const params = new URLSearchParams()
    if (game) params.set('game', game)

    const res = await fetch(
        `${process.env.SYMFONY_API_URL}/api/matches/upcoming?${params.toString()}`,
        { cache: 'no-store' }
    )

    if (!res.ok) throw new Error('Impossible de charger les matchs')
    const json = await res.json()
    return json.data ?? []
}

const GAMES = [
    { slug: '',         label: 'Tous',          color: 'text-white' },
    { slug: 'lol',      label: 'LoL',           color: 'text-yellow-400' },
    { slug: 'csgo',     label: 'CS2',           color: 'text-orange-400' },
    { slug: 'valorant', label: 'Valorant',      color: 'text-pink-400' },
    { slug: 'dota2',    label: 'Dota 2',        color: 'text-red-400' },
    { slug: 'r6siege',  label: 'R6',            color: 'text-blue-400' },
    { slug: 'rl',       label: 'Rocket League', color: 'text-sky-400' },
]

const GAME_ACCENT: Record<string, string> = {
    'LoL':             'border-yellow-500/40 bg-yellow-500/5',
    'Counter-Strike':  'border-orange-500/40 bg-orange-500/5',
    'Valorant':        'border-pink-500/40 bg-pink-500/5',
    'Dota 2':          'border-red-500/40 bg-red-500/5',
    'Rainbow 6 Siege': 'border-blue-500/40 bg-blue-500/5',
    'Rocket League':   'border-sky-500/40 bg-sky-500/5',
}

const GAME_BADGE: Record<string, string> = {
    'LoL':             'bg-yellow-500/20 text-yellow-300',
    'Counter-Strike':  'bg-orange-500/20 text-orange-300',
    'Valorant':        'bg-pink-500/20 text-pink-300',
    'Dota 2':          'bg-red-500/20 text-red-300',
    'Rainbow 6 Siege': 'bg-blue-500/20 text-blue-300',
    'Rocket League':   'bg-sky-500/20 text-sky-300',
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Date inconnue'
    return new Date(dateStr).toLocaleString('fr-FR', {
        day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit',
    })
}

function TierBadge({ tier }: { tier: string }) {
    const map: Record<string, string> = {
        s: 'bg-yellow-400/20 text-yellow-300 border border-yellow-500/30',
        a: 'bg-purple-400/20 text-purple-300 border border-purple-500/30',
        b: 'bg-blue-400/20 text-blue-300 border border-blue-500/30',
        c: 'bg-slate-400/20 text-slate-300 border border-slate-500/30',
        d: 'bg-slate-500/10 text-slate-400 border border-slate-600/20',
    }
    return (
        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${map[tier] ?? map.d}`}>
            {tier.toUpperCase()}
        </span>
    )
}

function TeamLogo({ url, name }: { url: string | null; name: string }) {
    if (url) {
        return (
            <Image
                src={url} alt={name} width={32} height={32}
                className="w-8 h-8 object-contain"
                unoptimized
            />
        )
    }
    return (
        <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
            {name.slice(0, 2).toUpperCase()}
        </div>
    )
}

function MatchCard({ match }: { match: Match }) {
    const [t1, t2]  = match.opponents ?? []
    const gameName   = match.videogame?.name ?? ''
    const accent     = GAME_ACCENT[gameName] ?? 'border-slate-700 bg-slate-800/40'
    const badge      = GAME_BADGE[gameName]  ?? 'bg-slate-700/50 text-slate-300'
    const hasStream  = match.streams_list?.length > 0
    const isLive     = match.live?.supported

    return (
        <Link
            href={`/matches/${match.id}`}
            className={`rounded-xl border ${accent} px-5 py-4 flex items-center gap-4
                        hover:brightness-110 hover:scale-[1.01] transition-all`}
        >
            {/* Jeu + tier */}
            <div className="hidden sm:flex flex-col items-center gap-1 w-20 shrink-0">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge}`}>
                    {gameName}
                </span>
                <TierBadge tier={match.tournament?.tier ?? 'd'} />
            </div>

            {/* Équipes */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <TeamLogo url={t1?.opponent?.image_url ?? null} name={t1?.opponent?.name ?? 'TBD'} />
                    <span className="font-semibold text-white text-sm truncate max-w-[90px]">
                        {t1?.opponent?.acronym ?? t1?.opponent?.name ?? 'TBD'}
                    </span>
                </div>

                <span className="text-slate-500 font-bold text-xs px-2">VS</span>

                <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm truncate max-w-[90px]">
                        {t2?.opponent?.acronym ?? t2?.opponent?.name ?? 'TBD'}
                    </span>
                    <TeamLogo url={t2?.opponent?.image_url ?? null} name={t2?.opponent?.name ?? 'TBD'} />
                </div>
            </div>

            {/* Infos droite */}
            <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                <span className="text-xs text-slate-400">{match.league?.name}</span>
                <span className="text-xs text-slate-500">{formatDate(match.scheduled_at)}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-slate-500">BO{match.number_of_games}</span>
                    {isLive && (
                        <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded-full font-semibold">
                            LIVE
                        </span>
                    )}
                    {hasStream && !isLive && (
                        <span className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded-full">
                            stream
                        </span>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default async function MatchesPage({
                                              searchParams,
                                          }: {
    searchParams: Promise<{ game?: string }>
}) {
    const { game } = await searchParams
    const matches  = await getUpcomingMatches(game)

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                    Matchs à venir
                </h1>
                <p className="text-slate-400 mt-1 text-sm">
                    {matches.length} match{matches.length > 1 ? 's' : ''} programmé{matches.length > 1 ? 's' : ''}
                </p>
            </div>

            {/* Filtres */}
            <div className="flex flex-wrap gap-2 mb-6">
                {GAMES.map(({ slug, label, color }) => {
                    const active = (game ?? '') === slug
                    return (
                        <a
                            key={slug}
                            href={slug ? `/matches?game=${slug}` : '/matches'}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                                ${active
                                ? `border-white/20 bg-white/10 ${color}`
                                : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                            }`}
                        >
                            {label}
                        </a>
                    )
                })}
            </div>

            {/* Liste */}
            <div className="flex flex-col gap-3">
                {matches.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        Aucun match à venir pour ce jeu.
                    </div>
                ) : (
                    matches.map((match) => (
                        <MatchCard key={match.id} match={match} />
                    ))
                )}
            </div>
        </div>
    )
}
