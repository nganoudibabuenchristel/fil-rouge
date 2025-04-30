<?php

// namespace App\Http\Requests;

// use Illuminate\Foundation\Http\FormRequest;

// class UpdateFurnitureListingRequest extends FormRequest
// {
//     /**
//      * Determine if the user is authorized to make this request.
//      */
//     public function authorize(): bool
//     {
//         return false;
//     }

//     /**
//      * Get the validation rules that apply to the request.
//      *
//      * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
//      */
//     public function rules(): array
//     {
//         return [
//             //
//         ];
//     }
// }

// app/Http/Requests/UpdateFurnitureListingRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFurnitureListingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->id === $this->route('listing')->user_id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['sometimes', 'exists:categories,id'],
            'subcategory_id' => [
                'sometimes', 
                'exists:subcategories,id',
                function ($attribute, $value, $fail) {
                    if (isset($this->category_id)) {
                        $categoryId = $this->category_id;
                    } else {
                        $categoryId = $this->route('listing')->category_id;
                    }
                    
                    $subcategory = \App\Models\Subcategory::find($value);
                    if ($subcategory && $subcategory->category_id != $categoryId) {
                        $fail('The selected subcategory does not belong to the selected category.');
                    }
                },
            ],
            'condition_id' => ['sometimes', 'exists:conditions,id'],
            'title' => ['sometimes', 'string', 'min:5', 'max:255'],
            'description' => ['sometimes', 'string', 'min:20'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'is_negotiable' => ['sometimes', 'boolean'],
            'city' => ['sometimes', 'string', 'max:100'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'latitude' => ['sometimes', 'nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'nullable', 'numeric', 'between:-180,180'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}