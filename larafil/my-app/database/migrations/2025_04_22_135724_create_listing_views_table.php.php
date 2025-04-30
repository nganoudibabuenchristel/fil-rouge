<?php

// database/migrations/2023_01_01_000007_create_listing_views_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listing_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('furniture_listing_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
            
            // Prevent duplicate counting of views within short timeframe
            $table->unique(['furniture_listing_id', 'ip_address', 'user_id'], 'unique_view');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listing_views');
    }
};