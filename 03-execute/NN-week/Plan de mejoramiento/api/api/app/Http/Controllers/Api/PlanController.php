<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\BusinessRuleException;
use App\Models\Plan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PlanController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'include_inactive' => ['sometimes', 'boolean'],
            'search' => ['sometimes', 'string', 'max:200'],
            'category_id' => ['sometimes', 'integer', 'min:1'],
        ]);

        $query = Plan::query()->with('category');

        if (!$request->boolean('include_inactive')) {
            $query->where('is_active', true);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];

            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('code', 'ilike', "%{$search}%")
                    ->orWhere('title', 'ilike', "%{$search}%");
            });
        }

        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        return $this->collection(
            $query->orderBy('id'),
            $request
        );
    }

    public function show(Plan $plan): JsonResponse
    {
        return response()->json([
            'data' => $plan->load('category'),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:60',
                'unique:plans,code',
            ],
            'title' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'category_id' => [
                'required',
                'integer',
                'exists:categories,id',
            ],
            'total_units' => [
                'required',
                'integer',
                'min:0',
            ],
        ]);

        $plan = DB::transaction(function () use ($validated) {
            $plan = new Plan();

            $plan->fill($validated);
            $plan->available_units = $validated['total_units'];
            $plan->is_active = true;

            $plan->save();

            return $plan->fresh('category');
        }, 3);

        return response()->json([
            'data' => $plan,
        ], 201);
    }

    public function update(
        Request $request,
        Plan $plan
    ): JsonResponse {
        $validated = $request->validate([
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:60',
                Rule::unique('plans', 'code')->ignore($plan->id),
            ],
            'title' => [
                'sometimes',
                'required',
                'string',
                'max:200',
            ],
            'description' => ['nullable', 'string'],
            'category_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:categories,id',
            ],
            'total_units' => [
                'sometimes',
                'required',
                'integer',
                'min:0',
            ],
        ]);

        try {
            $updatedPlan = DB::transaction(
                function () use ($plan, $validated) {
                    $lockedPlan = Plan::query()
                        ->lockForUpdate()
                        ->findOrFail($plan->id);

                    if (array_key_exists('total_units', $validated)) {
                        $borrowedUnits =
                            $lockedPlan->total_units
                            - $lockedPlan->available_units;

                        if (
                            $borrowedUnits < 0 ||
                            $validated['total_units'] < $borrowedUnits
                        ) {
                            throw new BusinessRuleException(
                                'INVENTORY_CONFLICT',
                                'El total no puede ser menor que las unidades prestadas.'
                            );
                        }

                        $lockedPlan->available_units =
                            $validated['total_units'] - $borrowedUnits;
                    }

                    $lockedPlan->fill($validated);
                    $lockedPlan->save();

                    return $lockedPlan->fresh('category');
                },
                3
            );

            return response()->json([
                'data' => $updatedPlan,
            ]);
        } catch (BusinessRuleException $exception) {
            return $this->conflict($exception);
        }
    }

    public function destroy(Plan $plan): JsonResponse
    {
        DB::transaction(function () use ($plan) {
            $lockedPlan = Plan::query()
                ->lockForUpdate()
                ->findOrFail($plan->id);

            $lockedPlan->is_active = false;
            $lockedPlan->save();
        }, 3);

        return response()->json(null, 204);
    }
}
