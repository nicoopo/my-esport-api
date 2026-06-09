<?php

namespace App\Controller;

use App\Service\PandaScoreService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/esport')]
class EsportController extends AbstractController
{
    public function __construct(
        private readonly PandaScoreService $pandaScore,
    ) {}

    // Exemple 1 : page Twig avec les matchs à venir
    #[Route('/matches', name: 'esport_matches')]
    public function upcomingMatches(): Response
    {
        $matches = $this->pandaScore->getUpcomingMatches([
            'filter[detailed_stats]' => 'true',
            'page[size]'             => 10,
        ]);

        return $this->render('esport/matches.html.twig', [
            'matches' => $matches,
        ]);
    }

    // Exemple 2 : endpoint JSON (pour un frontend JS)
    #[Route('/api/lol/matches', name: 'api_lol_matches')]
    public function lolMatches(): JsonResponse
    {
        $matches = $this->pandaScore->getUpcomingMatchesByGame('lol', [
            'page[size]' => 5,
        ]);

        return $this->json($matches);
    }

    // Exemple 3 : détail d'un match
    #[Route('/matches/{id}', name: 'esport_match_detail')]
    public function matchDetail(int $id): Response
    {
        $match = $this->pandaScore->getMatch($id);

        return $this->render('esport/match_detail.html.twig', [
            'match' => $match,
        ]);
    }
}
