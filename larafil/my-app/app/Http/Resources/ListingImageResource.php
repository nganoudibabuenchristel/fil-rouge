<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ListingImageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'listing_id' => $this->furniture_listing_id,
            'image_path' => $this->file_path,
            'file_name' => $this->file_name,
            'is_primary' => $this->is_primary,
            'order' => $this->order,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'url' => asset('storage/' . $this->file_path),
        ];
    }
}