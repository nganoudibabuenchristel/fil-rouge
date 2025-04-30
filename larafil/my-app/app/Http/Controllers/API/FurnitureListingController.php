<?php

// app/Http/Controllers/API/FurnitureListingController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFurnitureListingRequest;
use App\Http\Requests\UpdateFurnitureListingRequest;
use App\Http\Resources\FurnitureListingCollection;
use App\Http\Resources\FurnitureListingResource;
use App\Models\FurnitureListing;
use App\Models\ListingView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * @OA\Tag(
 *     name="Furniture Listings",
 *     description="API endpoints pour la gestion des annonces de meubles"
 * )
 */
class FurnitureListingController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/listings",
     *     summary="Liste toutes les annonces de meubles",
     *     tags={"Furniture Listings"},
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         required=false,
     *         description="Recherche par mot-clé",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="category_id",
     *         in="query",
     *         required=false,
     *         description="Filtrer par ID de catégorie",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="subcategory_id",
     *         in="query",
     *         required=false,
     *         description="Filtrer par ID de sous-catégorie",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="condition_id",
     *         in="query",
     *         required=false,
     *         description="Filtrer par ID de condition",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="min_price",
     *         in="query",
     *         required=false,
     *         description="Prix minimum",
     *         @OA\Schema(type="number")
     *     ),
     *     @OA\Parameter(
     *         name="max_price",
     *         in="query",
     *         required=false,
     *         description="Prix maximum",
     *         @OA\Schema(type="number")
     *     ),
     *     @OA\Parameter(
     *         name="city",
     *         in="query",
     *         required=false,
     *         description="Filtrer par ville",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="sort",
     *         in="query",
     *         required=false,
     *         description="Champ de tri (price, created_at)",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="direction",
     *         in="query",
     *         required=false,
     *         description="Direction du tri (asc, desc)",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         required=false,
     *         description="Numéro de page pour la pagination",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         required=false,
     *         description="Nombre d'éléments par page",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Liste des annonces",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/FurnitureListing")),
     *             @OA\Property(property="links", type="object"),
     *             @OA\Property(property="meta", type="object")
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $query = FurnitureListing::active()
            ->with(['category', 'subcategory', 'condition', 'user', 'primaryImage']);
        
        // Recherche par mot-clé
        if ($request->has('search')) {
            $query->search($request->search);
        }
        
        // Filtres de catégorie
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        
        if ($request->has('subcategory_id')) {
            $query->where('subcategory_id', $request->subcategory_id);
        }
        
        // Filtre de condition
        if ($request->has('condition_id')) {
            $query->byCondition($request->condition_id);
        }
        
        // Filtres de prix
        if ($request->has('min_price') || $request->has('max_price')) {
            $query->byPrice($request->min_price, $request->max_price);
        }
        
        // Filtre de localisation
        if ($request->has('city')) {
            $query->byCity($request->city);
        }
        
        // Tri
        $sortField = $request->input('sort', 'created_at');
        $direction = $request->input('direction', 'desc');
        
        // Sécurisation du tri pour éviter les injections SQL
        $allowedSortFields = ['price', 'created_at'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $direction === 'asc' ? 'asc' : 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }
        
        // Pagination
        $perPage = $request->input('per_page', 15);
        $listings = $query->paginate($perPage);
        
        return new FurnitureListingCollection($listings);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/listings",
     *     summary="Créer une nouvelle annonce",
     *     tags={"Furniture Listings"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/StoreFurnitureListingRequest")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Annonce créée",
     *         @OA\JsonContent(ref="#/components/schemas/FurnitureListing")
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erreur de validation"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié"
     *     )
     * )
     */
    public function store(StoreFurnitureListingRequest $request)
    {
        $validated = $request->validated();
        $validated['user_id'] = Auth::id();
        
        $listing = FurnitureListing::create($validated);
        
        return new FurnitureListingResource($listing);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/listings/{id}",
     *     summary="Affiche une annonce spécifique",
     *     tags={"Furniture Listings"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de l'annonce",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Annonce trouvée",
     *         @OA\JsonContent(ref="#/components/schemas/FurnitureListing")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Annonce non trouvée"
     *     )
     * )
     */
    public function show(FurnitureListing $listing)
    {
        return new FurnitureListingResource($listing->load([
            'category', 
            'subcategory', 
            'condition', 
            'user', 
            'images',
        ]));
    }

    /**
     * @OA\Put(
     *     path="/api/v1/listings/{id}",
     *     summary="Mettre à jour une annonce",
     *     tags={"Furniture Listings"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de l'annonce",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/UpdateFurnitureListingRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Annonce mise à jour",
     *         @OA\JsonContent(ref="#/components/schemas/FurnitureListing")
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erreur de validation"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Annonce non trouvée"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Action non autorisée"
     *     )
     * )
     */
    public function update(UpdateFurnitureListingRequest $request, FurnitureListing $listing)
    {
        // Vérification que l'utilisateur est le propriétaire de l'annonce
        if ($listing->user_id !== Auth::id()) {
            return response()->json(['message' => 'Vous n\'êtes pas autorisé à modifier cette annonce'], 403);
        }
        
        $validated = $request->validated();
        $listing->update($validated);
        
        return new FurnitureListingResource($listing->fresh(['category', 'subcategory', 'condition', 'images']));
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/listings/{id}",
     *     summary="Supprimer une annonce",
     *     tags={"Furniture Listings"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de l'annonce",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Annonce supprimée",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Annonce supprimée avec succès")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Annonce non trouvée"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Action non autorisée"
     *     )
     * )
     */
    public function destroy(FurnitureListing $listing)
    {
        // Vérification que l'utilisateur est le propriétaire de l'annonce
        if ($listing->user_id !== Auth::id()) {
            return response()->json(['message' => 'Vous n\'êtes pas autorisé à supprimer cette annonce'], 403);
        }
        
        // Suppression des images associées
        foreach ($listing->images as $image) {
            Storage::delete('public/' . $image->image_path);
        }
        
        $listing->delete();
        
        return response()->json(['message' => 'Annonce supprimée avec succès']);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/listings/{id}/views",
     *     summary="Incrémente le compteur de vues d'une annonce",
     *     tags={"Furniture Listings"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de l'annonce",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Vue enregistrée",
     *         @OA\JsonContent(
     *             @OA\Property(property="views_count", type="integer", example=42)
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Annonce non trouvée"
     *     )
     * )
     */
    public function incrementViews(Request $request, FurnitureListing $listing)
    {
        $userId = Auth::id();
        $ipAddress = $request->ip();
        
        // Vérifie si une vue de cet utilisateur ou de cette IP existe déjà dans les dernières 24h
        $existingView = ListingView::where('furniture_listing_id', $listing->id)
            ->where(function ($query) use ($userId, $ipAddress) {
                if ($userId) {
                    $query->where('user_id', $userId);
                } else {
                    $query->where('ip_address', $ipAddress);
                }
            })
            ->where('created_at', '>', now()->subDay())
            ->exists();
        
        // Si pas de vue existante, on en crée une nouvelle
        if (!$existingView) {
            ListingView::create([
                'furniture_listing_id' => $listing->id,
                'user_id' => $userId,
                'ip_address' => $ipAddress,
            ]);
        }
        
        // Compte le nombre total de vues
        $viewsCount = $listing->views()->count();
        
        return response()->json(['views_count' => $viewsCount]);
    }
}