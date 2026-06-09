<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

class PandaScoreService
{
    private const BASE_URL = 'https://api.pandascore.co';

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly string $apiToken,
    ) {}

    // ---------- Matches ----------

    public function getUpcomingMatches(array $filters = []): array
    {
        return $this->get('/matches/upcoming', $filters);
    }

    public function getRunningMatches(array $filters = []): array
    {
        return $this->get('/matches/running', $filters);
    }

    public function getPastMatches(array $filters = []): array
    {
        return $this->get('/matches/past', $filters);
    }

    public function getMatch(int $matchId): array
    {
        return $this->get("/matches/{$matchId}");
    }

    // ---------- Par jeu (ex: LoL, CS2, Dota2) ----------

    public function getUpcomingMatchesByGame(string $game, array $filters = []): array
    {
        // $game : 'lol', 'csgo' (CS2), 'dota2', 'valorant', 'rl', ...
        return $this->get("/{$game}/matches/upcoming", $filters);
    }

    // ---------- Leagues / Tournaments ----------

    public function getLeagues(string $game = null, array $filters = []): array
    {
        $path = $game ? "/{$game}/leagues" : '/leagues';
        return $this->get($path, $filters);
    }

    public function getTournaments(string $game = null, array $filters = []): array
    {
        $path = $game ? "/{$game}/tournaments" : '/tournaments/upcoming';
        return $this->get($path, $filters);
    }

    // ---------- Teams & Players ----------

    public function getTeam(int $teamId): array
    {
        return $this->get("/teams/{$teamId}");
    }

    public function getPlayer(int $playerId): array
    {
        return $this->get("/players/{$playerId}");
    }

    // ---------- Core HTTP ----------

    private function get(string $path, array $queryParams = []): array
    {
        try {
            $response = $this->httpClient->request('GET', self::BASE_URL . $path, [
                'headers' => [
                    'Authorization' => "Bearer {$this->apiToken}",
                    'Accept'        => 'application/json',
                ],
                'query' => array_merge([
                    'page[size]' => 20,
                ], $queryParams),
            ]);

            return $response->toArray();
        } catch (TransportExceptionInterface $e) {
            throw new \RuntimeException("PandaScore API error on {$path}: " . $e->getMessage(), 0, $e);
        }
    }
}
