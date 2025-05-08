<?php



use App\Http\Controllers\LoginController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\SubcategoryController;
use App\Http\Controllers\Api\FurnitureListingController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\API\ConditionController;
use App\Http\Controllers\Api\ListingImageController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CityController;
use App\Http\Resources\ListingImageResource;
use App\Models\FurnitureListing;
use App\Models\ListingImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Les routes API sont chargées par RouteServiceProvider et toutes sont
| préfixées par le groupe "api". Bonne pratique de versioning pour API.
|
*/

/**
 * Routes pour la gestion des villes
 * 
 * Ces routes permettent de gérer les villes disponibles sur la marketplace
 * Toutes les routes retournent des réponses au format JSON
 */


 
 Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
  });

  // Routes pour les villes
Route::apiResource('cities', CityController::class);
Route::get('cities/search', [CityController::class, 'search']);

// Routes pour les images d'annonces
Route::get('/listings/{furniture_listing}/images', [ListingImageController::class, 'index']);
// Route::post('/listings/{listing}/images', [ListingImageController::class, 'store']);
Route::get('/listings/{furniture_listing}/images/{image}', [ListingImageController::class, 'show']);
Route::put('/listings/{furniture_listing}/images/{image}', [ListingImageController::class, 'update']);
Route::delete('/listings/{furniture_listing}/images/{image}', [ListingImageController::class, 'destroy']);
Route::post('/listings/{furniture_listing}/images/{image}/set-primary', [ListingImageController::class, 'setPrimary']);
Route::post('/listings/{furniture_listing}/images/reorder', [ListingImageController::class, 'reorder']);


Route::apiResource('cities', \App\Http\Controllers\Api\CityController::class);

// Route optionnelle pour obtenir les villes par région
Route::get('regions/{region}/cities', [\App\Http\Controllers\Api\CityController::class, 'index'])
    ->name('regions.cities.index');

// Route pour rechercher des villes (avec autocomplétion)
Route::get('cities/search', [\App\Http\Controllers\Api\CityController::class, 'search'])
    ->name('cities.search');

/**
 * Routes pour les conditions
 */

 Route::get('/conditions', [ConditionController::class, 'index']);
    Route::get('/conditions/{condition}', [ConditionController::class, 'show']);

// Ou utiliser la version courte avec apiResource
// Route::apiResource('conditions', ConditionController::class)->only(['index', 'show']);

// Routes d'authentification
Route::prefix('auth')->group(function () {
    Route::post('/register', [RegisterController::class, 'register']);
    Route::post('/login', [LoginController::class, 'login']);
    
    // Routes protégées nécessitant une authentification
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [LoginController::class, 'logout']);
        Route::get('/user', [LoginController::class, 'user']);
    });
});

// Routes protégées par authentification
Route::middleware('auth:sanctum')->group(function () {
    // Routes pour les annonces
    Route::post('/listings/{listing}/images', [ListingImageController::class, 'store']);
    Route::post('/listings/{listing}/favorites', [FurnitureListingController::class, 'store']);
    Route::delete('/listings/{listing}/favorites', [FurnitureListingController::class, 'destroy']);
    Route::get('/listings/{listing}/views', [FurnitureListingController::class, 'getViews']);
    Route::post('/listings/{listing}/contact', [FurnitureListingController::class, 'contact']);
    Route::post('/listings/{listing}/report', [FurnitureListingController::class, 'report']);
    
    // Routes pour les catégories et sous-catégories
    Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);
    // Routes pour les notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/{notification}', [NotificationController::class, 'show']);
    Route::put('/notifications/{notification}', [NotificationController::class, 'update']);

    
});

// Routes publiques (sans authentification)
Route::apiResource('listings', FurnitureListingController::class);
Route::get('/me', [LoginController::class, 'me']);
Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);
Route::apiResource('listings', FurnitureListingController::class)->only(['index', 'show']);
Route::get('/subcategories/category_id={category}', [SubcategoryController::class, 'getByCategory']);
