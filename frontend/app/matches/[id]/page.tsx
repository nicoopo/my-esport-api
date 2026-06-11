import { Match, Stream } from '@/types/match'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getMatch(id: string): Promise<Match> {
    const res = await fetch(
        `${process.env.SYMFONY_API_URL}/api/matches/${id}`,
        { cache: 'no-store' }
    )
    console.log('Status:', res.status)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const json = await res.json()
    console.log('JSON keys:', Object.keys(json))
    console.log('data exists:', !!json.data)

    if (!json.data) notFound()

    return json.data
}

// ─── helpers ────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Date inconnue'
    return new Date(dateStr).toLocaleString('fr-FR', {
        weekday: 'long', day: '2-digit',
        month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

const GAME_ACCENT: Record<string, string> = {
    'LoL':             'from-yellow-500/20 to-transparent border-yellow-500/20',
    'Counter-Strike':  'from-orange-500/20 to-transparent border-orange-500/20',
    'Valorant':        'from-pink-500/20 to-transparent border-pink-500/20',
    'Dota 2':          'from-red-500/20 to-transparent border-red-500/20',
    'Rainbow 6 Siege': 'from-blue-500/20 to-transparent border-blue-500/20',
    'Rocket League':   'from-sky-500/20 to-transparent border-sky-500/20',
}

const GAME_BADGE: Record<string, string> = {
    'LoL':             'bg-yellow-500/20 text-yellow-300',
    'Counter-Strike':  'bg-orange-500/20 text-orange-300',
    'Valorant':        'bg-pink-500/20 text-pink-300',
    'Dota 2':          'bg-red-500/20 text-red-300',
    'Rainbow 6 Siege': 'bg-blue-500/20 text-blue-300',
    'Rocket League':   'bg-sky-500/20 text-sky-300',
}

const TIER_LABEL: Record<string, string> = {
    s: 'S — Premier',
    a: 'A — Majeur',
    b: 'B — Intermédiaire',
    c: 'C — Régional',
    d: 'D — Amateur',
}

function TeamLogo({ url, name, size = 64 }: { url: string | null; name: string; size?: number }) {
    if (url) {
        return (
            <Image
                src={url} alt={name}
                width={size} height={size}
                className="object-contain"
                style={{ width: size, height: size }}
                unoptimized
            />
        )
    }
    return (
        <div
            className="rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-400"
            style={{ width: size, height: size, fontSize: size * 0.3 }}
        >
            {name.slice(0, 2).toUpperCase()}
        </div>
    )
}

function StreamBadge({ stream }: { stream: Stream }) {
    const isYT     = stream.raw_url.includes('youtube')
    const isTwitch = stream.raw_url.includes('twitch')
    const isKick   = stream.raw_url.includes('kick')

    const icon  = isYT ? '▶' : isTwitch ? '🟣' : isKick ? '🟢' : '📺'
    const label = isYT ? 'YouTube' : isTwitch ? 'Twitch' : isKick ? 'Kick' : 'Stream'

    return (
        <a
            href={stream.raw_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10
                       text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
        >
            <span>{icon}</span>
            <span>{label}</span>
            {stream.language && (
                <span className="text-xs text-slate-500 uppercase">{stream.language}</span>
            )}
            {stream.official && (
                <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">
                    officiel
                </span>
            )}
        </a>
    )
}

// ─── page ───────────────────────────────────────────────────

export default async function MatchDetailPage({
                                                  params,
                                              }: {
    params: Promise<{ id: string }>
}) {
    const { id }   = await params
    const match    = await getMatch(id)
    const [t1, t2] = match.opponents ?? []
    const gameName = match.videogame?.name ?? ''
    const accent   = GAME_ACCENT[gameName] ?? 'from-slate-700/20 to-transparent border-slate-700/20'
    const badge    = GAME_BADGE[gameName]  ?? 'bg-slate-700/50 text-slate-300'

    const mainStreams  = match.streams_list?.filter(s => s.main)  ?? []
    const otherStreams = match.streams_list?.filter(s => !s.main) ?? []

    return (
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

            {/* Retour */}
            <Link
                href="/matches"
                className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
            >
                ← Retour aux matchs
            </Link>

            {/* Hero card */}
            <div className={`rounded-2xl border bg-gradient-to-b ${accent} p-8`}>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge}`}>
                        {gameName}
                    </span>
                    <span className="text-xs text-slate-500">
                        {match.league?.name} · {match.serie?.full_name}
                    </span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-slate-500">
                        {TIER_LABEL[match.tournament?.tier ?? 'd']}
                    </span>
                    {match.live?.supported && (
                        <span className="ml-auto text-xs bg-green-500/20 text-green-400 border border-green-500/30
                                         px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                            LIVE
                        </span>
                    )}
                </div>

                {/* Équipes */}
                <div className="flex items-center justify-between gap-4">

                    {/* Équipe 1 */}
                    <div className="flex flex-col items-center gap-3 flex-1">
                        <TeamLogo url={t1?.opponent?.image_url ?? null} name={t1?.opponent?.name ?? 'TBD'} size={72} />
                        <div className="text-center">
                            <p className="font-bold text-white text-lg leading-tight">
                                {t1?.opponent?.name ?? 'TBD'}
                            </p>
                            {t1?.opponent?.acronym && (
                                <p className="text-xs text-slate-500 mt-0.5">{t1.opponent.acronym}</p>
                            )}
                        </div>
                        {match.results?.[0] != null && (
                            <span className="text-3xl font-bold text-white tabular-nums">
                                {match.results[0].score}
                            </span>
                        )}
                    </div>

                    {/* Centre */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                        <span className="text-slate-600 font-black text-2xl">VS</span>
                        <span className="text-xs text-slate-500 font-medium">BO{match.number_of_games}</span>
                        {match.rescheduled && (
                            <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20
                                             px-1.5 py-0.5 rounded-full mt-1">
                                Reprogrammé
                            </span>
                        )}
                    </div>

                    {/* Équipe 2 */}
                    <div className="flex flex-col items-center gap-3 flex-1">
                        <TeamLogo url={t2?.opponent?.image_url ?? null} name={t2?.opponent?.name ?? 'TBD'} size={72} />
                        <div className="text-center">
                            <p className="font-bold text-white text-lg leading-tight">
                                {t2?.opponent?.name ?? 'TBD'}
                            </p>
                            {t2?.opponent?.acronym && (
                                <p className="text-xs text-slate-500 mt-0.5">{t2.opponent.acronym}</p>
                            )}
                        </div>
                        {match.results?.[1] != null && (
                            <span className="text-3xl font-bold text-white tabular-nums">
                                {match.results[1].score}
                            </span>
                        )}
                    </div>
                </div>

                {/* Date */}
                <p className="text-center text-sm text-slate-400 mt-6 capitalize">
                    {formatDate(match.scheduled_at ?? match.begin_at)}
                </p>
            </div>

            {/* Streams */}
            {(match.streams_list?.length ?? 0) > 0 && (
                <section className="space-y-3">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Regarder le match
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {[...mainStreams, ...otherStreams].map((s, i) => (
                            <StreamBadge key={i} stream={s} />
                        ))}
                    </div>
                </section>
            )}

            {/* Infos tournoi */}
            <section className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-3">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Tournoi
                </h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <p className="text-slate-500 text-xs mb-0.5">Ligue</p>
                        <p className="text-white font-medium">{match.league?.name ?? '—'}</p>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs mb-0.5">Série</p>
                        <p className="text-white font-medium">{match.serie?.full_name ?? '—'}</p>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs mb-0.5">Phase</p>
                        <p className="text-white font-medium">{match.tournament?.name ?? '—'}</p>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs mb-0.5">Format</p>
                        <p className="text-white font-medium">Best of {match.number_of_games}</p>
                    </div>
                    {match.tournament?.type && (
                        <div>
                            <p className="text-slate-500 text-xs mb-0.5">Type</p>
                            <p className="text-white font-medium capitalize">{match.tournament.type}</p>
                        </div>
                    )}
                    {match.tournament?.region && (
                        <div>
                            <p className="text-slate-500 text-xs mb-0.5">Région</p>
                            <p className="text-white font-medium">{match.tournament.region}</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
