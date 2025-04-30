<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ListingImageResource;
use App\Models\Listing;
use App\Models\ListingImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ListingImageController extends Controller
{
    /**
     * Affiche toutes les images d'une annonce
     * 
     * @param Listing $listing
     * @return JsonResponse
     */
    public function index(Listing $listing): JsonResponse
    {
        $images = $listing->images;
        
        return response()->json([
            'images' => ListingImageResource::collection($images)
        ]);
    }

    /**
     * Télécharge une ou plusieurs nouvelles images pour une annonce
     * 
     * @param Request $request
     * @param Listing $listing
     * @return JsonResponse
     */
    public function store(Request $request, Listing $listing): JsonResponse
    {
        // Vérification que l'utilisateur est bien propriétaire de l'annonce
        $this->authorize('update', $listing);
        
        $request->validate([
            'images' => 'required|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $uploadedImages = [];

        foreach ($request->file('images') as $image) {
            $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('public/listings', $filename);
            
            $listingImage = $listing->images()->create([
                'filename' => $filename,
                'path' => Storage::url($path),
                'order' => $listing->images()->count() + 1 // Pour l'ordre d'affichage
            ]);
            
            $uploadedImages[] = new ListingImageResource($listingImage);
        }

        return response()->json([
            'message' => count($uploadedImages) . ' image(s) téléchargée(s) avec succès',
            'images' => $uploadedImages
        ], 201);
    }

    /**
     * Affiche les détails d'une image spécifique
     * 
     * @param Listing $listing
     * @param ListingImage $image
     * @return ListingImageResource
     */
    public function show(Listing $listing, ListingImage $image): ListingImageResource
    {
        // Vérifier que l'image appartient bien à l'annonce
        if ($image->listing_id !== $listing->id) {
            abort(404, 'Image not found for this listing');
        }
        
        return new ListingImageResource($image);
    }

    /**
     * Met à jour les informations d'une image (ordre, description)
     * 
     * @param Request $request
     * @param Listing $listing
     * @param ListingImage $image
     * @return JsonResponse
     */
    public function update(Request $request, Listing $listing, ListingImage $image): JsonResponse
    {
        // Vérification que l'utilisateur est bien propriétaire de l'annonce
        $this->authorize('update', $listing);
        
        // Vérifier que l'image appartient bien à l'annonce
        if ($image->listing_id !== $listing->id) {
            abort(404, 'Image not found for this listing');
        }
        
        $request->validate([
            'order' => 'nullable|integer|min:1',
            'description' => 'nullable|string|max:255',
            'is_primary' => 'nullable|boolean'
        ]);
        
        // Si on définit cette image comme principale
        if ($request->has('is_primary') && $request->is_primary) {
            // Réinitialiser toutes les autres images comme non-principales
            $listing->images()->where('id', '!=', $image->id)->update(['is_primary' => false]);
            $image->is_primary = true;
        }
        
        // Mettre à jour l'ordre ou la description si fournis
        if ($request->has('order')) {
            $image->order = $request->order;
        }
        
        if ($request->has('description')) {
            $image->description = $request->description;
        }
        
        $image->save();
        
        return response()->json([
            'message' => 'Image mise à jour avec succès',
            'image' => new ListingImageResource($image)
        ]);
    }

    /**
     * Supprime une image spécifique d'une annonce
     * 
     * @param Listing $listing
     * @param ListingImage $image
     * @return JsonResponse
     */
    public function destroy(Listing $listing, ListingImage $image): JsonResponse
    {
        // Vérification que l'utilisateur est bien propriétaire de l'annonce
        $this->authorize('update', $listing);
        
        // Vérifier que l'image appartient bien à l'annonce
        if ($image->listing_id !== $listing->id) {
            abort(404, 'Image not found for this listing');
        }
        
        // Supprimer le fichier physique
        Storage::delete('public/listings/' . $image->filename);
        
        // Supprimer l'entrée en base de données
        $image->delete();
        
        // Réorganiser l'ordre des images restantes si nécessaire
        $this->reorderImages($listing);
        
        return response()->json([
            'message' => 'Image supprimée avec succès'
        ]);
    }
    
    /**
     * Définit une image comme image principale de l'annonce
     * 
     * @param Listing $listing
     * @param ListingImage $image
     * @return JsonResponse
     */
    public function setPrimary(Listing $listing, ListingImage $image): JsonResponse
    {
        // Vérification que l'utilisateur est bien propriétaire de l'annonce
        $this->authorize('update', $listing);
        
        // Vérifier que l'image appartient bien à l'annonce
        if ($image->listing_id !== $listing->id) {
            abort(404, 'Image not found for this listing');
        }
        
        // Réinitialiser toutes les images comme non-principales
        $listing->images()->update(['is_primary' => false]);
        
        // Définir cette image comme principale
        $image->is_primary = true;
        $image->save();
        
        return response()->json([
            'message' => 'Image définie comme principale',
            'image' => new ListingImageResource($image)
        ]);
    }
    
    /**
     * Réorganise l'ordre des images après suppression
     * 
     * @param Listing $listing
     * @return void
     */
    private function reorderImages(Listing $listing): void
    {
        $images = $listing->images()->orderBy('order')->get();
        
        foreach ($images as $index => $image) {
            $image->order = $index + 1;
            $image->save();
        }
    }
    
    /**
     * Réorganise toutes les images d'une annonce selon l'ordre fourni
     * 
     * @param Request $request
     * @param Listing $listing
     * @return JsonResponse
     */
    public function reorder(Request $request, Listing $listing): JsonResponse
    {
        // Vérification que l'utilisateur est bien propriétaire de l'annonce
        $this->authorize('update', $listing);
        
        $request->validate([
            'order' => 'required|array',
            'order.*' => 'required|integer|exists:listing_images,id'
        ]);
        
        $orderData = $request->order;
        
        // Vérifier que tous les IDs appartiennent bien à cette annonce
        $listingImageIds = $listing->images()->pluck('id')->toArray();
        foreach ($orderData as $id) {
            if (!in_array($id, $listingImageIds)) {
                return response()->json([
                    'message' => 'Certaines images n\'appartiennent pas à cette annonce'
                ], 400);
            }
        }
        
        // Mettre à jour l'ordre des images
        foreach ($orderData as $index => $imageId) {
            ListingImage::where('id', $imageId)->update(['order' => $index + 1]);
        }
        
        return response()->json([
            'message' => 'Ordre des images mis à jour avec succès',
            'images' => ListingImageResource::collection($listing->images()->orderBy('order')->get())
        ]);
    }
}