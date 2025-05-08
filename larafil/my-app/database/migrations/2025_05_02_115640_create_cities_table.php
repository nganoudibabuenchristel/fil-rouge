<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCitiesTable extends Migration
{
    /**
     * Exécuter les migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->string('name');                  // Nom de la ville
            $table->string('slug')->unique();        // Slug pour URL (ex: paris, marseille)
            $table->string('postal_code')->nullable(); // Code postal (peut être null)
            $table->decimal('latitude', 10, 7)->nullable();  // Latitude pour géolocalisation
            $table->decimal('longitude', 10, 7)->nullable(); // Longitude pour géolocalisation
            $table->boolean('is_active')->default(true); // Si la ville est active/disponible
            $table->timestamps();
            
            // Index pour améliorer les performances de recherche
            $table->index('name');
            $table->index('postal_code');
            
        });
    }

    /**
     * Inverser les migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('cities');
    }
}