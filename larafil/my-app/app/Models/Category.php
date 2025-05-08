<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Category extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'icon',
    ];

    /**
     * Get the subcategories for the category.
     */
    public function subcategories()
    {
        return $this->hasMany(Subcategory::class);
    }

    /**
     * Get the furniture listings for the category.
     */
    public function furnitureListings()
    {
        return $this->hasMany(FurnitureListing::class);
    }
}