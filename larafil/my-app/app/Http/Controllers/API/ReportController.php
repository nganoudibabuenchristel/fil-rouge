<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReportRequest;
use App\Http\Resources\ReportCollection;
use App\Http\Resources\ReportResource;
use App\Models\Listing;
use App\Models\Report;
use App\Models\User;
use App\Notifications\ListingReported;
use App\Notifications\ReportStatusChanged;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Crée un nouveau signalement pour une annonce
     * 
     * @param ReportRequest $request
     * @param Listing $listing
     * @return JsonResponse
     */
    public function store(ReportRequest $request, Listing $listing): JsonResponse
    {
        $user = auth()->user();
        
        // Vérifier si l'utilisateur a déjà signalé cette annonce
        $existingReport = Report::where('user_id', $user->id)
            ->where('listing_id', $listing->id)
            ->exists();
            
        if ($existingReport) {
            return response()->json([
                'message' => 'Vous avez déjà signalé cette annonce'
            ], 409); // Conflict
        }
        
        // Créer le signalement
        $report = Report::create([
            'user_id' => $user->id,
            'listing_id' => $listing->id,
            'reason' => $request->reason,
            'description' => $request->description,
            'status' => 'pending' // par défaut
        ]);
        
        // Notifier les administrateurs (pourrait être implémenté avec des événements)
        // Exemple: Admin::all()->each->notify(new ListingReported($report));
        
        // Notifier le propriétaire de l'annonce que son annonce a été signalée
        $listing->user->notify(new ListingReported($report));
        
        return response()->json([
            'message' => 'Annonce signalée avec succès',
            'report' => new ReportResource($report)
        ], 201);
    }
    
    /**
     * Récupère les signalements effectués par l'utilisateur connecté
     * 
     * @return ReportCollection
     */
    public function myReports(): ReportCollection
    {
        $user = auth()->user();
        $reports = $user->reports()
            ->with(['listing', 'listing.user'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);
            
        return new ReportCollection($reports);
    }
    
    /**
     * Récupère les signalements sur les annonces de l'utilisateur connecté
     * 
     * @return ReportCollection
     */
    public function reportsOnMyListings(): ReportCollection
    {
        $user = auth()->user();
        $listingIds = $user->listings()->pluck('id');
        
        $reports = Report::whereIn('listing_id', $listingIds)
            ->with(['user', 'listing'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);
            
        return new ReportCollection($reports);
    }
    
    /**
     * Affiche les détails d'un signalement
     * 
     * @param Report $report
     * @return JsonResponse
     */
    public function show(Report $report): JsonResponse
    {
        // Vérifier que l'utilisateur est autorisé à voir ce signalement
        $user = auth()->user();
        $isAdmin = $user->hasRole('admin'); // Assume un système de rôles
        $isReporter = $report->user_id === $user->id;
        $isListingOwner = $report->listing->user_id === $user->id;
        
        if (!$isAdmin && !$isReporter && !$isListingOwner) {
            return response()->json([
                'message' => 'Non autorisé'
            ], 403);
        }
        
        return response()->json([
            'report' => new ReportResource($report->load(['user', 'listing', 'listing.user']))
        ]);
    }
    
    /**
     * Met à jour le statut d'un signalement (admin seulement)
     * 
     * @param Request $request
     * @param Report $report
     * @return JsonResponse
     */
    public function updateStatus(Request $request, Report $report): JsonResponse
    {
        // Vérifier que l'utilisateur est administrateur
        $user = auth()->user();
        if (!$user->hasRole('admin')) {
            return response()->json([
                'message' => 'Non autorisé'
            ], 403);
        }
        
        $request->validate([
            'status' => 'required|string|in:pending,investigating,resolved,rejected',
            'admin_comment' => 'nullable|string|max:1000'
        ]);
        
        $oldStatus = $report->status;
        
        $report->update([
            'status' => $request->status,
            'admin_comment' => $request->admin_comment,
            'admin_id' => $user->id,
            'resolved_at' => in_array($request->status, ['resolved', 'rejected']) ? now() : null
        ]);
        
        // Notifier l'utilisateur qui a fait le signalement du changement de statut
        $report->user->notify(new ReportStatusChanged($report, $oldStatus));
        
        // Notifier également le propriétaire de l'annonce si le signalement est résolu
        if (in_array($request->status, ['resolved', 'rejected'])) {
            $report->listing->user->notify(new ReportStatusChanged($report, $oldStatus));
        }
        
        return response()->json([
            'message' => 'Statut du signalement mis à jour avec succès',
            'report' => new ReportResource($report)
        ]);
    }
    
    /**
     * Liste tous les signalements (admin seulement)
     * 
     * @param Request $request
     * @return ReportCollection
     */
    public function index(Request $request): ReportCollection
    {
        // Vérifier que l'utilisateur est administrateur
        $user = auth()->user();
        if (!$user->hasRole('admin')) {
            abort(403, 'Non autorisé');
        }
        
        $query = Report::query()->with(['user', 'listing', 'listing.user']);
        
        // Filtrage par statut
        if ($request->has('status') && in_array($request->status, ['pending', 'investigating', 'resolved', 'rejected'])) {
            $query->where('status', $request->status);
        }
        
        // Filtrage par raison
        if ($request->has('reason')) {
            $query->where('reason', $request->reason);
        }
        
        // Filtrage par date
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        
        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        
        // Tri
        $sortField = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        
        if (in_array($sortField, ['created_at', 'status', 'reason', 'resolved_at'])) {
            $query->orderBy($sortField, $sortDirection);
        }
        
        $reports = $query->paginate(15);
        
        return new ReportCollection($reports);
    }
    
    /**
     * Statistiques des signalements (admin seulement)
     * 
     * @return JsonResponse
     */
    public function statistics(): JsonResponse
    {
        // Vérifier que l'utilisateur est administrateur
        $user = auth()->user();
        if (!$user->hasRole('admin')) {
            return response()->json([
                'message' => 'Non autorisé'
            ], 403);
        }
        
        $totalReports = Report::count();
        $pendingReports = Report::where('status', 'pending')->count();
        $investigatingReports = Report::where('status', 'investigating')->count();
        $resolvedReports = Report::where('status', 'resolved')->count();
        $rejectedReports = Report::where('status', 'rejected')->count();
        
        $reportsByReason = Report::select('reason')
            ->selectRaw('count(*) as count')
            ->groupBy('reason')
            ->get();
            
        $reportsByMonth = Report::selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, count(*) as count')
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get();
            
        return response()->json([
            'total' => $totalReports,
            'by_status' => [
                'pending' => $pendingReports,
                'investigating' => $investigatingReports,
                'resolved' => $resolvedReports,
                'rejected' => $rejectedReports
            ],
            'by_reason' => $reportsByReason,
            'by_month' => $reportsByMonth
        ]);
    }
    
    /**
     * Supprimer un signalement (admin seulement)
     * 
     * @param Report $report
     * @return JsonResponse
     */
    public function destroy(Report $report): JsonResponse
    {
        // Vérifier que l'utilisateur est administrateur
        $user = auth()->user();
        if (!$user->hasRole('admin')) {
            return response()->json([
                'message' => 'Non autorisé'
            ], 403);
        }
        
        $report->delete();
        
        return response()->json([
            'message' => 'Signalement supprimé avec succès'
        ]);
    }
    
    /**
     * Actions rapides sur les signalements (admin seulement)
     * 
     * @param Request $request
     * @param Report $report
     * @return JsonResponse
     */
    public function takeAction(Request $request, Report $report): JsonResponse
    {
        // Vérifier que l'utilisateur est administrateur
        $user = auth()->user();
        if (!$user->hasRole('admin')) {
            return response()->json([
                'message' => 'Non autorisé'
            ], 403);
        }
        
        $request->validate([
            'action' => 'required|string|in:approve,reject,hide_listing,block_user',
            'comment' => 'nullable|string|max:1000'
        ]);
        
        $action = $request->action;
        $listing = $report->listing;
        $reportedUser = $listing->user;
        
        switch ($action) {
            case 'approve':
                // Approuver le signalement
                $report->update([
                    'status' => 'resolved',
                    'admin_comment' => $request->comment,
                    'admin_id' => $user->id,
                    'resolved_at' => now()
                ]);
                break;
                
            case 'reject':
                // Rejeter le signalement
                $report->update([
                    'status' => 'rejected',
                    'admin_comment' => $request->comment,
                    'admin_id' => $user->id,
                    'resolved_at' => now()
                ]);
                break;
                
            case 'hide_listing':
                // Cacher l'annonce
                $listing->update([
                    'status' => 'hidden',
                    'hidden_reason' => 'Contenu signalé comme inapproprié'
                ]);
                
                $report->update([
                    'status' => 'resolved',
                    'admin_comment' => $request->comment ?? 'Annonce masquée suite au signalement',
                    'admin_id' => $user->id,
                    'resolved_at' => now()
                ]);
                break;
                
            case 'block_user':
                // Bloquer l'utilisateur
                $reportedUser->update([
                    'is_active' => false,
                    'blocked_at' => now(),
                    'blocked_reason' => 'Contenu inapproprié publié'
                ]);
                
                // Cacher toutes ses annonces
                $reportedUser->listings()->update([
                    'status' => 'hidden',
                    'hidden_reason' => 'Utilisateur bloqué'
                ]);
                
                $report->update([
                    'status' => 'resolved',
                    'admin_comment' => $request->comment ?? 'Utilisateur bloqué suite au signalement',
                    'admin_id' => $user->id,
                    'resolved_at' => now()
                ]);
                break;
        }
        
        // Notifier l'utilisateur qui a fait le signalement
        $report->user->notify(new ReportStatusChanged($report, 'pending'));
        
        // Notifier le propriétaire de l'annonce des actions prises
        if (in_array($action, ['hide_listing', 'block_user'])) {
            // Notification spéciale pour des actions plus graves
            // À implémenter: $reportedUser->notify(new ContentModeratedNotification($action, $listing));
        }
        
        return response()->json([
            'message' => 'Action effectuée avec succès',
            'report' => new ReportResource($report->fresh())
        ]);
    }
    
    /**
     * Récupère les raisons de signalement disponibles
     * 
     * @return JsonResponse
     */
    public function reasons(): JsonResponse
    {
        // Liste des raisons prédéfinies pour les signalements
        $reasons = [
            'illegal' => 'Contenu illégal ou frauduleux',
            'inappropriate' => 'Contenu inapproprié',
            'offensive' => 'Contenu offensant ou discriminatoire',
            'fake' => 'Fausse annonce',
            'spam' => 'Spam ou publicité non sollicitée',
            'duplicate' => 'Annonce en double',
            'wrong_category' => 'Mauvaise catégorie',
            'scam' => 'Arnaque potentielle',
            'other' => 'Autre raison'
        ];
        
        return response()->json([
            'reasons' => $reasons
        ]);
    }
}
