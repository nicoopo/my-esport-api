import { NextRequest, NextResponse } from 'next/server'

const SYMFONY_API = process.env.SYMFONY_API_URL ?? 'http://localhost:8000'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)

    const game    = searchParams.get('game') ?? ''
    const page    = searchParams.get('page') ?? '1'
    const perPage = searchParams.get('per_page') ?? '20'

    const params = new URLSearchParams({ page, per_page: perPage })
    if (game) params.set('game', game)

    try {
        const res = await fetch(
            `${SYMFONY_API}/api/matches/upcoming?${params.toString()}`,
            {
                next: { revalidate: 60 }, // cache 60s côté Next
            }
        )

        if (!res.ok) {
            return NextResponse.json(
                { error: 'Erreur lors de la récupération des matchs' },
                { status: res.status }
            )
        }

        const data = await res.json()
        return NextResponse.json(data)

    } catch (e) {
        return NextResponse.json(
            { error: 'Symfony API inaccessible' },
            { status: 503 }
        )
    }
}
