<?php

// namespace App\Http\Resources;

// use Illuminate\Http\Request;
// use Illuminate\Http\Resources\Json\JsonResource;

// class FurnitureListingResource extends JsonResource
// {
//     /**
//      * Transform the resource into an array.
//      *
//      * @return array<string, mixed>
//      */
//     public function toArray(Request $request): array
//     {
//         return parent::toArray($request);
//     }
// }

// app/Http/Resources/FurnitureListingResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FurnitureListingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'category_id' => $this->category_id,
            'subcategory_id' => $this->subcategory_id,
            'condition_id' => $this->condition_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => $this->price,
            'is_negotiable' => $this->is_negotiable,
            'city' => $this->city,
            'address' => $this->address,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'is_active' => $this->is_active,
            'sold_at' => $this->sold_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relationships
            'user' => new UserResource($this->whenLoaded('user')),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'subcategory' => new SubcategoryResource($this->whenLoaded('subcategory')),
            'condition' => $this->whenLoaded('condition'),
            'images' => $this->whenLoaded('images', function() {
                return $this->images->map(function($image) {
                    return [
                        'id' => $image->id,
                        'is_primary' => $image->is_primary,
                        'sort_order' => $image->sort_order,
                        'url' => asset('storage/' . $image->image_path),
                    ];
                });
            }),
            'primary_image' => $this->whenLoaded('primaryImage', function() {
                return $this->primaryImage ? asset('storage/' . $this->primaryImage->image_path) : null;
            }),
            
            // Dynamic properties
            'whatsapp_link' => $this->when($this->user && $this->user->phone, $this->getWhatsAppLink()),
            'favorites_count' => $this->when(isset($this->favorites_count), $this->favorites_count),
            'views_count' => $this->when(isset($this->views_count), $this->views_count),
            'is_favorite' => $this->when(isset($this->is_favorite), $this->is_favorite),
        ];
    }
}