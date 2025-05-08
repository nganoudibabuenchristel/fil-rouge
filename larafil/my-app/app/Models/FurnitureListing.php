<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use App\Models\User;



class FurnitureListing extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'category_id',
        'subcategory_id',
        'condition_id',
        'title',
        'slug',
        'description',
        'price',
        'is_negotiable',
        'city_id',
        'address',
        'latitude',
        'longitude',
        'is_active',
        'sold_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'is_negotiable' => 'boolean',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'is_active' => 'boolean',
        'sold_at' => 'datetime',
    ];

    /**
     * Get the user that owns the furniture listing.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the category of the furniture listing.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the subcategory of the furniture listing.
     */
    public function subcategory()
    {
        return $this->belongsTo(Subcategory::class);
    }

    /**
     * Get the condition of the furniture listing.
     */
    public function condition()
    {
        return $this->belongsTo(Condition::class);
    }

    /**
     * Get the images for the furniture listing.
     */
    public function images()
    {
        return $this->hasMany(ListingImage::class);
    }

    /**
     * Get the primary image for the furniture listing.
     */
    public function primaryImage()
    {
        return $this->hasOne(ListingImage::class)->where('is_primary', true);
    }

    /**
     * Get the favorites for the furniture listing.
     */
    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    /**
     * Get the users who favorited this listing.
     */
    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'favorites')
            ->withTimestamps();
    }

    /**
     * Get the views for the furniture listing.
     */
    public function views()
    {
        return $this->hasMany(ListingView::class);
    }

    /**
     * Get the contact requests for the furniture listing.
     */
    public function contactRequests()
    {
        return $this->hasMany(ContactRequest::class);
    }

    /**
     * Get the reports for the furniture listing.
     */
    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    /**
     * Scope a query to include only active listings.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->whereNull('sold_at');
    }

    /**
     * Generate WhatsApp link for the listing.
     */
    public function getWhatsAppLink()
    {
        if (!$this->user || !$this->user->phone) {
            return null;
        }

        $phone = preg_replace('/[^0-9]/', '', $this->user->phone);
        $message = "Bonjour, je suis intéressé(e) par votre annonce '{$this->title}' à {$this->price} EUR sur la marketplace. Est-elle toujours disponible ?";
        
        return 'https://wa.me/' . $phone . '?text=' . urlencode($message);
    }

    protected static function booted()
{
    static::creating(function ($listing) {
        if (empty($listing->slug)) {
            $listing->slug = Str::slug($listing->title);
        }
    });
}

}