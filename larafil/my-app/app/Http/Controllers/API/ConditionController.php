<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\ConditionResource;
use App\Models\Condition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;


class ConditionController extends Controller
{
    /**
     * Display a listing of the conditions.
     * 
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index()
    {
        Log::error('Une erreur est survenue');
        $conditions = Condition::all();
        return ConditionResource::collection($conditions);
    }
    
    /**
     * Display the specified condition.
     * 
     * @param Condition $condition
     * @return ConditionResource
     */
    public function show(Condition $condition)
    {
        return new ConditionResource($condition);
    }
}