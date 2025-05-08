<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CityRequest extends FormRequest
{
    /**
     * Déterminer si l'utilisateur est autorisé à faire cette requête.
     *
     * @return bool
     */
    public function authorize()
    {
        // La vérification des permissions se fait dans le contrôleur
        return true;
    }

    /**
     * Obtenir les règles de validation qui s'appliquent à la requête.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        $rules = [
            'name' => ['required', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'region_id' => ['nullable', 'exists:regions,id'],
            'is_active' => ['boolean'],
        ];
        
        // Règle unique pour le nom de ville lors de la création
        if ($this->isMethod('post')) {
            $rules['name'][] = Rule::unique('cities', 'name');
        }
        
        // Règle unique pour le nom de ville lors de la mise à jour
        if ($this->isMethod('put') || $this->isMethod('patch')) {
            $rules['name'][] = Rule::unique('cities', 'name')->ignore($this->city);
        }
        
        return $rules;
    }

    /**
     * Obtenir les messages d'erreur personnalisés pour les règles de validation.
     *
     * @return array<string, string>
     */
    public function messages()
    {
        return [
            'name.required' => 'Le nom de la ville est obligatoire.',
            'name.unique' => 'Cette ville existe déjà.',
            'latitude.between' => 'La latitude doit être entre -90 et 90.',
            'longitude.between' => 'La longitude doit être entre -180 et 180.',
            'region_id.exists' => 'La région sélectionnée n\'existe pas.',
        ];
    }
}