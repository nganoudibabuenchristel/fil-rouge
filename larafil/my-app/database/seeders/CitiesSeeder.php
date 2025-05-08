<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CitiesSeeder extends Seeder
{
    /**
     * Exécuter le seeder.
     *
     * @return void
     */
    public function run()
    {
        // Principales villes françaises
        $cities = [
            [
                'name' => 'Paris',
                'postal_code' => '75000',
                'latitude' => 48.856614,
                'longitude' => 2.352222,
                'region_id' => 1, // Île-de-France
            ],
            [
                'name' => 'Marseille',
                'postal_code' => '13000',
                'latitude' => 43.296482,
                'longitude' => 5.369780,
                'region_id' => 2, // PACA
            ],
            [
                'name' => 'Lyon',
                'postal_code' => '69000',
                'latitude' => 45.764043,
                'longitude' => 4.835659,
                'region_id' => 3, // Auvergne-Rhône-Alpes
            ],
            [
                'name' => 'Toulouse',
                'postal_code' => '31000',
                'latitude' => 43.604652,
                'longitude' => 1.444209,
                'region_id' => 4, // Occitanie
            ],
            [
                'name' => 'Nice',
                'postal_code' => '06000',
                'latitude' => 43.710173,
                'longitude' => 7.261953,
                'region_id' => 2, // PACA
            ],
            [
                'name' => 'Nantes',
                'postal_code' => '44000',
                'latitude' => 47.218371,
                'longitude' => -1.553621,
                'region_id' => 5, // Pays de la Loire
            ],
            [
                'name' => 'Strasbourg',
                'postal_code' => '67000',
                'latitude' => 48.573405,
                'longitude' => 7.752111,
                'region_id' => 6, // Grand Est
            ],
            [
                'name' => 'Montpellier',
                'postal_code' => '34000',
                'latitude' => 43.610769,
                'longitude' => 3.876716,
                'region_id' => 4, // Occitanie
            ],
            [
                'name' => 'Bordeaux',
                'postal_code' => '33000',
                'latitude' => 44.837789,
                'longitude' => -0.579180,
                'region_id' => 7, // Nouvelle-Aquitaine
            ],
            [
                'name' => 'Lille',
                'postal_code' => '59000',
                'latitude' => 50.629250,
                'longitude' => 3.057256,
                'region_id' => 8, // Hauts-de-France
            ],
        ];

        foreach ($cities as $city) {
            City::create([
                'name' => $city['name'],
                'slug' => Str::slug($city['name']),
                'postal_code' => $city['postal_code'],
                'latitude' => $city['latitude'],
                'longitude' => $city['longitude'],
                'region_id' => $city['region_id'],
                'is_active' => true,
            ]);
        }
        
        // Vous pouvez également utiliser la factory pour générer plus de données de test
        // City::factory()->count(50)->create();
    }
}