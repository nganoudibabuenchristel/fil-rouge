<?php

// app/Http/Controllers/API/UserController.php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    /**
     * Update the authenticated user's profile.
     * 
     * @param UpdateUserRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(UpdateUserRequest $request)
    {
        $user = $request->user();
        $user->update($request->validated());
        
        return response()->json([
            'status' => 'success',
            'message' => 'User profile updated successfully',
            'user' => new UserResource($user),
        ]);
    }
    
    /**
     * Upload user avatar.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);
        
        $user = $request->user();
        
        if ($user->avatar) {
            Storage::delete('public/' . $user->avatar);
        }
        
        $path = $request->file('avatar')->store('avatars', 'public');
        $user->avatar = $path;
        $user->save();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Avatar uploaded successfully',
            'user' => new UserResource($user),
        ]);
    }
    
    /**
     * Get user's listings.
     * 
     * @param Request $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function listings(Request $request)
    {
        $listings = $request->user()->furnitureListings()
            ->with(['category', 'subcategory', 'condition', 'primaryImage'])
            ->latest()
            ->paginate(10);
        
        return new \App\Http\Resources\FurnitureListingCollection($listings);
    }
    
    /**
     * Get user's favorites.
     * 
     * @param Request $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function favorites(Request $request)
    {
        $favorites = $request->user()->favoritedListings()
            ->with(['category', 'subcategory', 'condition', 'primaryImage'])
            ->latest()
            ->paginate(10);
        
        return new \App\Http\Resources\FurnitureListingCollection($favorites);
    }
}
