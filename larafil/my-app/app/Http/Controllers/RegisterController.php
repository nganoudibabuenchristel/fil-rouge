<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class RegisterController extends Controller
{
    /**
     * Enregistre un nouvel utilisateur dans le système
     *
     * Cette méthode permet la création d'un nouveau compte utilisateur.
     * Elle valide les données soumises, crée l'utilisateur en base de données
     * et retourne un token d'authentification pour une connexion immédiate.
     *
     * @param  \Illuminate\Http\Request  $request Requête contenant les données d'inscription
     * @return \Illuminate\Http\JsonResponse
     *
     * @throws \Illuminate\Validation\ValidationException Si les données sont invalides
     */
    public function register(Request $request)
    {
        // Validation des données d'entrée avec règles détaillées
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => [
                'required', 
                'string', 
                'confirmed', 
                Password::min(8)
                    ->letters()      // Au moins une lettre
                    ->mixedCase()    // Au moins une majuscule et une minuscule
                    ->numbers()      // Au moins un chiffre
                    ->symbols()      // Au moins un symbole
            ],
            'phone' => ['nullable', 'string', 'regex:/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:100'],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
        ], [
            'name.required' => 'Le nom est obligatoire',
            'email.required' => 'L\'adresse email est obligatoire',
            'email.email' => 'Veuillez fournir une adresse email valide',
            'email.unique' => 'Cette adresse email est déjà utilisée',
            'password.required' => 'Le mot de passe est obligatoire',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas',
            'phone.regex' => 'Le format du numéro de téléphone est invalide',
        ]);

        // Retourne les erreurs de validation si présentes
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur de validation des données',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Démarrage d'une transaction pour assurer l'intégrité des données
            \DB::beginTransaction();
            
            // Création de l'utilisateur avec les données de base
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'address' => $request->address,
                'city' => $request->city,
                'postal_code' => $request->postal_code,
                'country' => $request->country,
                'email_verified_at' => null, // L'email devra être vérifié
            ]);
            
            // Gestion de l'avatar si fourni
            if ($request->hasFile('avatar')) {
                $avatarPath = $request->file('avatar')->store('avatars', 'public');
                $user->avatar = $avatarPath;
                $user->save();
            }
            
            // Envoi d'email de vérification (à implémenter selon les besoins)
            // $user->sendEmailVerificationNotification();
            
            // Génération du token d'authentification
            $token = $user->createToken('auth_token')->plainTextToken;
            
            // Validation de la transaction
            \DB::commit();
            
            // Retour d'une réponse avec le token et les données utilisateur formatées via Resource
            return response()->json([
                'status' => 'success',
                'message' => 'Utilisateur enregistré avec succès',
                'data' => [
                    'user' => new UserResource($user),
                    'access_token' => $token,
                    'token_type' => 'Bearer',
                ]
            ], 201);
            
        } catch (\Exception $e) {
            // En cas d'erreur, annulation de la transaction
            \DB::rollBack();
            
            // Log de l'erreur pour le débogage
            \Log::error('Erreur lors de l\'inscription: ' . $e->getMessage());
            
            // Retour d'une réponse d'erreur générique sans exposer les détails techniques
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue lors de l\'inscription',
            ], 500);
        }
    }
    
    /**
     * Renvoie un email de vérification à l'utilisateur
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resendVerificationEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'string', 'email', 'exists:users,email'],
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $user = User::where('email', $request->email)->first();
        
        // Si l'email est déjà vérifié
        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'status' => 'success',
                'message' => 'L\'adresse e-mail est déjà vérifiée'
            ]);
        }
        
        // Envoi d'un nouvel email de vérification
        $user->sendEmailVerificationNotification();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Email de vérification envoyé avec succès'
        ]);
    }
    
    /**
     * Vérifie l'adresse email d'un utilisateur
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function verifyEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => ['required', 'integer', 'exists:users,id'],
            'hash' => ['required', 'string'],
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lien de vérification invalide',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $user = User::findOrFail($request->id);
        
        // Logique de vérification à implémenter selon votre système
        // ...
        
        // Marquer l'email comme vérifié
        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Adresse email vérifiée avec succès'
        ]);
    }
}