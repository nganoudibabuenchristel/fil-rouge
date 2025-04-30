<?php


// app/Models/ListingView.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ListingView extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'furniture_listing_id',
        'user_id',
        'ip_address',
        'user_agent',
    ];

    /**
     * Get the furniture listing that was viewed.
     */
    public function furnitureListing()
    {
        return $this->belongsTo(FurnitureListing::class);
    }

    /**
     * Get the user who viewed the listing.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}