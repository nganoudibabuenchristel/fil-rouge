<?php

namespace Database\Seeders;

use App\Models\Condition;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ConditionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $conditions = [
            [
                'name' => 'Neuf',
                'description' => 'Article jamais utilisé, dans son emballage d\'origine'
            ],
            [
                'name' => 'Très bon état',
                'description' => 'Article utilisé très peu de temps, aucun défaut visible'
            ],
            [
                'name' => 'Bon état',
                'description' => 'Article utilisé avec quelques traces d\'usure mineures'
            ],
            [
                'name' => 'État acceptable',
                'description' => 'Article utilisé avec des traces d\'usure visibles mais fonctionnel'
            ]
        ];

        foreach ($conditions as $condition) {
            Condition::create($condition);
        }
    }
}