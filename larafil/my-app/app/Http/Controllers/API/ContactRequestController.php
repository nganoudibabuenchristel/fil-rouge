<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContactRequest;
use App\Http\Resources\ContactRequestResource;
use App\Models\Listing;
use App\Models\User;
use App\Notifications\NewContactRequest;
use Illuminate\Http\JsonResponse;

class ContactRequestController extends Controller
{
    /**
     * Envoyer une demande de contact à propos d'une annonce
     * 
     * @param ContactRequest $request
     * @param Listing $listing
     * @return JsonResponse
     */
    public function store(ContactRequest $request, Listing $listing): JsonResponse
    {
        $user = auth()->user();
        $seller = $listing->user;
        
        // Créer la demande de contact
        $contactRequest = $listing->contactRequests()->create([
            'user_id' => $user->id,
            'seller_id' => $seller->id,
            'message' => $request->message,
            'phone' => $request->phone
        ]);
        
        // Notifier le vendeur
        $seller->notify(new NewContactRequest($contactRequest));
        
        return response()->json([
            'message' => 'Demande de contact envoyée avec succès',
            'contact_request' => new ContactRequestResource($contactRequest)
        ], 201);
    }
    
    /**
     * Récupérer les demandes de contact reçues par l'utilisateur connecté
     * 
     * @return JsonResponse
     */
    public function received(): JsonResponse
    {
        $user = auth()->user();
        $contactRequests = $user->receivedContactRequests()
            ->with(['listing', 'user'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        
        return response()->json([
            'contact_requests' => ContactRequestResource::collection($contactRequests),
            'pagination' => [
                'total' => $contactRequests->total(),
                'per_page' => $contactRequests->perPage(),
                'current_page' => $contactRequests->currentPage(),
                'last_page' => $contactRequests->lastPage()
            ]
        ]);
    }
    
    /**
     * Récupérer les demandes de contact envoyées par l'utilisateur connecté
     * 
     * @return JsonResponse
     */
    public function sent(): JsonResponse
    {
        $user = auth()->user();
        $contactRequests = $user->sentContactRequests()
            ->with(['listing', 'seller'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        
        return response()->json([
            'contact_requests' => ContactRequestResource::collection($contactRequests),
            'pagination' => [
                'total' => $contactRequests->total(),
                'per_page' => $contactRequests->perPage(),
                'current_page' => $contactRequests->currentPage(),
                'last_page' => $contactRequests->lastPage()
            ]
        ]);
    }
    
    /**
     * Marquer une demande de contact comme lue
     * 
     * @param ContactRequest $contactRequest
     * @return JsonResponse
     */
    public function markAsRead(ContactRequest $contactRequest): JsonResponse
    {
        // Vérifier que l'utilisateur est bien le destinataire
        if ($contactRequest->seller_id !== auth()->id()) {
            return response()->json([
                'message' => 'Non autorisé'
            ], 403);
        }
        
        $contactRequest->update([
            'read_at' => now()
        ]);
        
        return response()->json([
            'message' => 'Demande de contact marquée comme lue',
            'contact_request' => new ContactRequestResource($contactRequest)
        ]);
    }
}