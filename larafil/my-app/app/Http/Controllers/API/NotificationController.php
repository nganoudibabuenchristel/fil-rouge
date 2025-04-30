<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Récupérer toutes les notifications de l'utilisateur
     * 
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();
        $notifications = $user->notifications()->paginate(10);
        
        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $user->unreadNotifications()->count()
        ]);
    }
    
    /**
     * Récupérer uniquement les notifications non lues
     * 
     * @return JsonResponse
     */
    public function unread(): JsonResponse
    {
        $user = auth()->user();
        $notifications = $user->unreadNotifications()->paginate(10);
        
        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $user->unreadNotifications()->count()
        ]);
    }
    
    /**
     * Marquer une notification comme lue
     * 
     * @param String $id
     * @return JsonResponse
     */
    public function markAsRead(string $id): JsonResponse
    {
        $user = auth()->user();
        $notification = $user->notifications()->findOrFail($id);
        $notification->markAsRead();
        
        return response()->json([
            'message' => 'Notification marquée comme lue'
        ]);
    }
    
    /**
     * Marquer toutes les notifications comme lues
     * 
     * @return JsonResponse
     */
    public function markAllAsRead(): JsonResponse
    {
        $user = auth()->user();
        $user->unreadNotifications->markAsRead();
        
        return response()->json([
            'message' => 'Toutes les notifications ont été marquées comme lues'
        ]);
    }
    
    /**
     * Supprimer une notification
     * 
     * @param String $id
     * @return JsonResponse
     */
    public function destroy(string $id): JsonResponse
    {
        $user = auth()->user();
        $notification = $user->notifications()->findOrFail($id);
        $notification->delete();
        
        return response()->json([
            'message' => 'Notification supprimée avec succès'
        ]);
    }
    
    /**
     * Supprimer toutes les notifications
     * 
     * @return JsonResponse
     */
    public function destroyAll(): JsonResponse
    {
        $user = auth()->user();
        $user->notifications()->delete();
        
        return response()->json([
            'message' => 'Toutes les notifications ont été supprimées'
        ]);
    }
}
