<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ListingCollection;
use App\Http\Resources\ListingResource;
use App\Models\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    /**
     * Ajouter une annonce aux favoris
     * 
     * @param Listing $listing
     * @return JsonResponse
     */
    public function store(Listing $listing): JsonResponse
    {
        $user = auth()->user();
        
        // Vérifier si l'annonce est déjà en favoris
        if ($user->favorites()->where('listing_id', $listing->id)->exists()) {
            return response()->json([
                'message' => 'Cette annonce est déjà dans vos favoris'
            ], 409);
        }
        
        // Ajouter l'annonce aux favoris
        $user->favorites()->attach($listing->id);
        
        return response()->json([
            'message' => 'Annonce ajoutée aux favoris avec succès'
        ]);
    }
    
    /**
     * Supprimer une annonce des favoris
     * 
     * @param Listing $listing
     * @return JsonResponse
     */
    public function destroy(Listing $listing): JsonResponse
    {
        $user = auth()->user();
        
        // Vérifier si l'annonce est en favoris
        if (!$user->favorites()->where('listing_id', $listing->id)->exists()) {
            return response()->json([
                'message' => 'Cette annonce n\'est pas dans vos favoris'
            ], 404);
        }
        
        // Supprimer l'annonce des favoris
        $user->favorites()->detach($listing->id);
        
        return response()->json([
            'message' => 'Annonce retirée des favoris avec succès'
        ]);
    }
    
    /**
     * Afficher la liste des annonces en favoris de l'utilisateur connecté
     * 
     * @return ListingCollection
     */
    public function index(): ListingCollection
    {
        $user = auth()->user();
        $favorites = $user->favorites()->with(['category', 'subcategory', 'user', 'images'])->paginate(10);
        
        return new ListingCollection($favorites);
    }
    
    /**
     * Vérifier si une annonce est en favoris pour l'utilisateur connecté
     * 
     * @param Listing $listing
     * @return JsonResponse
     */
    public function check(Listing $listing): JsonResponse
    {
        $user = auth()->user();
        $isFavorite = $user->favorites()->where('listing_id', $listing->id)->exists();
        
        return response()->json([
            'is_favorite' => $isFavorite
        ]);
    }
}