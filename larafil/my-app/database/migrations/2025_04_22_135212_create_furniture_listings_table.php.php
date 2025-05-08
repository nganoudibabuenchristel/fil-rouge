<?php

// database/migrations/2023_01_01_000004_create_furniture_listings_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('furniture_listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained();
            $table->foreignId('subcategory_id')->constrained();
            $table->foreignId('condition_id')->constrained();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->decimal('price', 10, 2);
            $table->boolean('is_negotiable')->default(false);
            $table->string('city');
            $table->string('address')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('sold_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('furniture_listings');
    }
};

class AddCityIdToFurnitureListingsTable extends Migration
{
    /**
     * Exécuter les migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('furniture_listings', function (Blueprint $table) {
            // Ajouter la colonne city_id qui fait référence à la table cities
            $table->unsignedBigInteger('city_id')->nullable()->after('condition_id');
            
            // Ajouter la contrainte de clé étrangère
            $table->foreign('city_id')
                ->references('id')
                ->on('cities')
                ->onDelete('set null'); // Si une ville est supprimée, conserver l'annonce mais mettre city_id à null
            
            // Ajouter un index pour améliorer les performances de requête
            $table->index('city_id');
        });
    }

    /**
     * Inverser les migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('furniture_listings', function (Blueprint $table) {
            // Supprimer la contrainte de clé étrangère
            $table->dropForeign(['city_id']);
            
            // Supprimer l'index
            $table->dropIndex(['city_id']);
            
            // Supprimer la colonne
            $table->dropColumn('city_id');
        });
    }
}