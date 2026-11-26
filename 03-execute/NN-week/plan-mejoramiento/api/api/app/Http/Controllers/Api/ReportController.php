<?php

namespace App\Http\Controllers\Api;

use App\Models\Loan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends ApiController
{
    /**
     * Return the most requested plans.
     */
    public function mostRequested(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'limit' => [
                'sometimes',
                'integer',
                'min:1',
                'max:100',
            ],
        ]);

        $limit = $validated['limit'] ?? 10;

        $plans = Loan::query()
            ->join('plans', 'plans.id', '=', 'loans.plan_id')
            ->selectRaw(
                'plans.id AS plan_id,
                 plans.code,
                 plans.title,
                 COUNT(loans.id) AS loan_count'
            )
            ->groupBy(
                'plans.id',
                'plans.code',
                'plans.title'
            )
            ->orderByDesc('loan_count')
            ->orderBy('plans.code')
            ->limit($limit)
            ->get();

        return response()->json([
            'data' => $plans,
        ]);
    }
}
