<?php

// app/Http/Controllers/API/CategoryController.php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of the categories.
     * 
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index()
    {
        $categories = Category::with('subcategories')->get();
        
        return CategoryResource::collection($categories);
    }
    
    /**
     * Display the specified category.
     * 
     * @param Category $category
     * @return CategoryResource
     */
    public function show(Category $category)
    {
        $category->load('subcategories');
        
        return new CategoryResource($category);
    }
}


