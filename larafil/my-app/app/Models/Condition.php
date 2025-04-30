<?php

// app/Models/Condition.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Condition extends Model
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
        'description',
    ];

    /**
     * Get the furniture listings for the condition.
     */
    public function furnitureListings()
    {
        return $this->hasMany(FurnitureListing::class);
    }
}
