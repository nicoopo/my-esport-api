export interface Match {
    id: number
    name: string
    status: 'not_started' | 'running' | 'finished'
    scheduled_at: string | null
    begin_at: string | null
    end_at: string | null
    match_type: string
    number_of_games: number
    forfeit: boolean
    draw: boolean
    rescheduled: boolean
    videogame: Videogame
    league: League
    serie: Serie
    tournament: Tournament
    opponents: Opponent[]
    results: Result[]
    streams_list: Stream[]
    live: Live
}

export interface Videogame {
    id: number
    name: string
    slug: string
}

export interface League {
    id: number
    name: string
    slug: string
    image_url: string | null
    url: string | null
}

export interface Serie {
    id: number
    name: string
    full_name: string
    year: number
    season: string | null
    begin_at: string | null
    end_at: string | null
}

export interface Tournament {
    id: number
    name: string
    tier: string
    type: string
    region: string | null
    country: string | null
}

export interface Opponent {
    type: 'Team' | 'Player'
    opponent: Team
}

export interface Team {
    id: number
    name: string
    acronym: string | null
    slug: string
    location: string | null
    image_url: string | null
    dark_mode_image_url: string | null
}

export interface Result {
    team_id: number
    score: number
}

export interface Stream {
    main: boolean
    language: string
    raw_url: string
    embed_url: string
    official: boolean
}

export interface Live {
    supported: boolean
    url: string | null
    opens_at: string | null
}
