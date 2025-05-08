<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\City; // Assurez-vous d'avoir un modèle City
use Illuminate\Support\Facades\Validator;

class CityController extends Controller
{
    /**
     * Display a listing of the resource.
     * 
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        try {
            // Récupérer toutes les villes
            $cities = City::orderBy('name', 'asc')->get();
            
            return response()->json($cities, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la récupération des villes', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // Validation des données
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:cities',
            'postal_code' => 'required|string|max:10',
            // Ajoutez d'autres champs selon votre modèle
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Créer une nouvelle ville
            $city = City::create($request->all());
            
            return response()->json($city, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la création de la ville', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     * 
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        try {
            $city = City::findOrFail($id);
            
            return response()->json($city, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Ville non trouvée', 'error' => $e->getMessage()], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        // Validation des données
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255|unique:cities,name,' . $id,
            'postal_code' => 'sometimes|required|string|max:10',
            // Ajoutez d'autres champs selon votre modèle
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $city = City::findOrFail($id);
            $city->update($request->all());
            
            return response()->json($city, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la mise à jour de la ville', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     * 
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        try {
            $city = City::findOrFail($id);
            $city->delete();
            
            return response()->json(['message' => 'Ville supprimée avec succès'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la suppression de la ville', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Search cities by name or postal code
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function search(Request $request)
    {
        $query = $request->input('query');
        
        try {
            $cities = City::where('name', 'like', "%{$query}%")
                        ->orWhere('postal_code', 'like', "%{$query}%")
                        ->get();
            
            return response()->json($cities, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la recherche de villes', 'error' => $e->getMessage()], 500);
        }
    }
}