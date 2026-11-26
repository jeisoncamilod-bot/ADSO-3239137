<?php

namespace App\Http\Controllers\Api;

use App\Models\Engineer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EngineerController extends ApiController
{
    /**
     * List engineers with pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Engineer::query()->orderBy('id');

        return $this->collection($query, $request);
    }

    /**
     * Display an engineer.
     */
    public function show(Engineer $engineer): JsonResponse
    {
        return response()->json([
            'data' => $engineer,
        ]);
    }

    /**
     * Create a new engineer.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_code' => [
                'required',
                'string',
                'max:60',
                'unique:engineers,employee_code',
            ],
            'full_name' => [
                'required',
                'string',
                'max:180',
            ],
            'email' => [
                'nullable',
                'email',
                'max:180',
                'unique:engineers,email',
            ],
        ]);

        $engineer = new Engineer();

        $engineer->fill($validated);
        $engineer->is_active = true;
        $engineer->save();

        return response()->json([
            'data' => $engineer->fresh(),
        ], 201);
    }

    /**
     * Update an existing engineer.
     */
    public function update(
        Request $request,
        Engineer $engineer
    ): JsonResponse {
        $validated = $request->validate([
            'employee_code' => [
                'sometimes',
                'required',
                'string',
                'max:60',
                Rule::unique('engineers', 'employee_code')
                    ->ignore($engineer->id),
            ],
            'full_name' => [
                'sometimes',
                'required',
                'string',
                'max:180',
            ],
            'email' => [
                'sometimes',
                'nullable',
                'email',
                'max:180',
                Rule::unique('engineers', 'email')
                    ->ignore($engineer->id),
            ],
            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ]);

        $engineer->fill($validated);
        $engineer->save();

        return response()->json([
            'data' => $engineer->fresh(),
        ]);
    }
}
