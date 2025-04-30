<?php



use App\Http\Controllers\LoginController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\SubcategoryController;
use App\Http\Controllers\Api\FurnitureListingController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\NotificationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Les routes API sont chargées par RouteServiceProvider et toutes sont
| préfixées par le groupe "api". Bonne pratique de versioning pour API.
|
*/

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
    Route::apiResource('listings', FurnitureListingController::class);
    Route::post('/listings/{listing}/images', [FurnitureListingController::class, 'uploadImage']);
    Route::post('/listings/{listing}/favorites', [FurnitureListingController::class, 'store']);
    Route::delete('/listings/{listing}/favorites', [FurnitureListingController::class, 'destroy']);
    Route::get('/listings/{listing}/views', [FurnitureListingController::class, 'getViews']);
    Route::post('/listings/{listing}/contact', [FurnitureListingController::class, 'contact']);
    Route::post('/listings/{listing}/report', [FurnitureListingController::class, 'report']);
    
    // Routes pour les catégories et sous-catégories
    Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);
    Route::get('/subcategories/category_id={category}', [SubcategoryController::class, 'getByCategory']);

    // Routes pour les notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/{notification}', [NotificationController::class, 'show']);
    Route::put('/notifications/{notification}', [NotificationController::class, 'update']);
});

// Routes publiques (sans authentification)
Route::get('/me', [LoginController::class, 'me']);
Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);
Route::apiResource('listings', FurnitureListingController::class)->only(['index', 'show']);