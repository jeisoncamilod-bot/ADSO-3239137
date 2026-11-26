<?php

namespace App\Http\Controllers\Api;

use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends ApiController
{
    /**
     * List all plan categories.
     */
    public function index(): JsonResponse
    {
        $categories = Category::query()
            ->orderBy('id')
            ->get();

        return response()->json([
            'data' => $categories,
        ]);
    }
}
