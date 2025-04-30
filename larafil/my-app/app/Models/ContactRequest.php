<?php


// app/Models/ContactRequest.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactRequest extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'furniture_listing_id',
        'sender_id',
        'message',
        'is_read',
        'read_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    /**
     * Get the furniture listing associated with the contact request.
     */
    public function furnitureListing()
    {
        return $this->belongsTo(FurnitureListing::class);
    }

    /**
     * Get the sender of the contact request.
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
