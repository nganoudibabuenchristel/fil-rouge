<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

/**
 * Classe Controller de base pour tous les contrôleurs de l'application
 * 
 * Cette classe étend le contrôleur de base de Laravel et inclut les traits
 * nécessaires pour l'autorisation, la validation et la gestion des jobs.
 * 
 * @package App\Http\Controllers
 */
class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;
    
    /**
     * Réponse JSON standardisée pour les API
     * 
     * @param mixed $data Les données à inclure dans la réponse
     * @param string $message Message de statut
     * @param int $status Code de statut HTTP
     * @param array $headers En-têtes HTTP supplémentaires
     * @return \Illuminate\Http\JsonResponse
     */
    protected function apiResponse($data = null, string $message = '', int $status = 200, array $headers = []): \Illuminate\Http\JsonResponse
    {
        $response = [
            'success' => $status >= 200 && $status < 300,
            'message' => $message,
        ];
        
        if ($data !== null) {
            $response['data'] = $data;
        }
        
        return response()->json($response, $status, $headers);
    }
    
    /**
     * Réponse de succès standardisée
     * 
     * @param mixed $data Les données à inclure dans la réponse
     * @param string $message Message de succès
     * @param int $status Code de statut HTTP (par défaut 200)
     * @param array $headers En-têtes HTTP supplémentaires
     * @return \Illuminate\Http\JsonResponse
     */
    protected function successResponse($data = null, string $message = 'Opération réussie', int $status = 200, array $headers = []): \Illuminate\Http\JsonResponse
    {
        return $this->apiResponse($data, $message, $status, $headers);
    }
    
    /**
     * Réponse d'erreur standardisée
     * 
     * @param string $message Message d'erreur
     * @param int $status Code de statut HTTP (par défaut 400)
     * @param mixed $data Données d'erreur supplémentaires
     * @param array $headers En-têtes HTTP supplémentaires
     * @return \Illuminate\Http\JsonResponse
     */
    protected function errorResponse(string $message = 'Une erreur est survenue', int $status = 400, $data = null, array $headers = []): \Illuminate\Http\JsonResponse
    {
        return $this->apiResponse($data, $message, $status, $headers);
    }
    
    /**
     * Vérifie si une requête est une requête API
     * 
     * @return bool
     */
    protected function isApiRequest(): bool
    {
        return request()->is('api/*') || request()->expectsJson();
    }
    
    /**
     * Vérifie si l'utilisateur actuel est un administrateur
     * 
     * @return bool
     */
    protected function isAdmin(): bool
    {
        return auth()->check() && auth()->user()->hasRole('admin');
    }
    
    /**
     * Génère une réponse de pagination standardisée pour les API
     * 
     * @param \Illuminate\Pagination\LengthAwarePaginator $paginator
     * @param mixed $resource La ressource à utiliser pour transformer les données
     * @param string $message Message à inclure dans la réponse
     * @return \Illuminate\Http\JsonResponse
     */
    protected function paginatedResponse($paginator, $resource, string $message = ''): \Illuminate\Http\JsonResponse
    {
        $data = [
            'items' => $resource::collection($paginator->items()),
            'pagination' => [
                'total' => $paginator->total(),
                'count' => $paginator->count(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'total_pages' => $paginator->lastPage(),
                'links' => [
                    'next' => $paginator->nextPageUrl(),
                    'prev' => $paginator->previousPageUrl(),
                    'first' => $paginator->url(1),
                    'last' => $paginator->url($paginator->lastPage()),
                ],
            ],
        ];
        
        return $this->successResponse($data, $message);
    }
}