<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CityResource extends JsonResource
{
    /**
     * Transformer la ressource en tableau.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'postal_code' => $this->postal_code,
            'coordinates' => [
                'latitude' => $this->latitude,
                'longitude' => $this->longitude,
            ],
            'region' => $this->when($this->relationLoaded('region'), function () {
                return [
                    'id' => $this->region->id,
                    'name' => $this->region->name,
                ];
            }),
            'is_active' => $this->is_active,
            'listings_count' => $this->when(
                $this->furnitureListings_count !== null, 
                $this->furnitureListings_count
            ),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}