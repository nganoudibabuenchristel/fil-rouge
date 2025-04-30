<?php

// app/Http/Controllers/API/SubcategoryController.php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubcategoryResource;
use App\Models\Category;
use App\Models\Subcategory;
use Illuminate\Http\Request;

class SubcategoryController extends Controller
{
    /**
     * Display a listing of the subcategories.
     * 
     * @param Request $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(Request $request)
    {
        $query = Subcategory::query();
        
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        
        $subcategories = $query->get();
        
        return SubcategoryResource::collection($subcategories);
    }
    
    /**
     * Display the specified subcategory.
     * 
     * @param Subcategory $subcategory
     * @return SubcategoryResource
     */
    public function show(Subcategory $subcategory)
    {
        $subcategory->load('category');
        
        return new SubcategoryResource($subcategory);
    }
    
    /**
     * Get subcategories for a specific category.
     * 
     * @param Category $category
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function byCategory(Category $category)
    {
        $subcategories = $category->subcategories;
        
        return SubcategoryResource::collection($subcategories);
    }
}