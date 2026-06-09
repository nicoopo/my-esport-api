<?php

namespace App\Controller;

use App\Service\PandaScoreService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/matches', name: 'api_matches_')]
class MatchController extends AbstractController
{
    public function __construct(
        private readonly PandaScoreService $pandaScore,
    ) {}

    // GET /api/matches/upcoming?game=lol&page=1
    #[Route('/upcoming', name: 'upcoming', methods: ['GET'])]
    public function upcoming(Request $request): JsonResponse
    {
        $game    = $request->query->get('game');       // 'lol', 'csgo', 'dota2'...
        $page    = $request->query->getInt('page', 1);
        $perPage = $request->query->getInt('per_page', 20);

        $filters = [
            'page[number]' => $page,
            'page[size]'   => $perPage,
        ];

        $matches = $game
            ? $this->pandaScore->getUpcomingMatchesByGame($game, $filters)
            : $this->pandaScore->getUpcomingMatches($filters);

        return $this->json([
            'data' => $matches,
            'meta' => [
                'page'     => $page,
                'per_page' => $perPage,
                'game'     => $game,
            ],
        ]);
    }

    // GET /api/matches/running
    #[Route('/running', name: 'running', methods: ['GET'])]
    public function running(): JsonResponse
    {
        return $this->json([
            'data' => $this->pandaScore->getRunningMatches(),
        ]);
    }

    // GET /api/matches/past?game=csgo
    #[Route('/past', name: 'past', methods: ['GET'])]
    public function past(Request $request): JsonResponse
    {
        $game = $request->query->get('game');

        $matches = $game
            ? $this->pandaScore->getUpcomingMatchesByGame($game . '/past', [])
            : $this->pandaScore->getPastMatches();

        return $this->json(['data' => $matches]);
    }

    // GET /api/matches/{id}
    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $match = $this->pandaScore->getMatch($id);

        return $this->json(['data' => $match]);
    }
}
