<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\BusinessRuleException;
use App\Models\Loan;
use App\Services\LoanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class LoanController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'engineer_id' => ['sometimes', 'integer', 'min:1'],
            'plan_id' => ['sometimes', 'integer', 'min:1'],
            'status' => [
                'sometimes',
                'string',
                Rule::in(['open', 'closed', 'overdue']),
            ],
        ]);

        $query = Loan::query()
            ->with(['loanReturn', 'plan', 'engineer']);

        if (isset($validated['engineer_id'])) {
            $query->where(
                'engineer_id',
                $validated['engineer_id']
            );
        }

        if (isset($validated['plan_id'])) {
            $query->where(
                'plan_id',
                $validated['plan_id']
            );
        }

        if (isset($validated['status'])) {
            $status = $validated['status'];

            if ($status === 'closed') {
                $query->whereHas('loanReturn');
            } else {
                $query->whereDoesntHave('loanReturn');

                // Overdue loans are open loans past their due date.
                if ($status === 'overdue') {
                    $query->where(
                        'due_at',
                        '<',
                        Carbon::now('UTC')
                    );
                }
            }
        }

        return $this->collection(
            $query->orderByDesc('id'),
            $request
        );
    }

    public function show(Loan $loan): JsonResponse
    {
        return response()->json([
            'data' => $loan->load([
                'loanReturn',
                'plan',
                'engineer',
            ]),
        ]);
    }

    public function store(
        Request $request,
        LoanService $service
    ): JsonResponse {
        $validated = $request->validate([
            'engineer_id' => [
                'required',
                'integer',
                'exists:engineers,id',
            ],
            'plan_id' => [
                'required',
                'integer',
                'exists:plans,id',
            ],
        ]);

        try {
            $loan = $service->create(
                $validated['engineer_id'],
                $validated['plan_id']
            );

            return response()->json([
                'data' => $loan,
            ], 201);
        } catch (BusinessRuleException $exception) {
            return $this->conflict($exception);
        }
    }

    public function returnLoan(
        Loan $loan,
        LoanService $service
    ): JsonResponse {
        try {
            $loanReturn = $service->returnLoan($loan->id);

            return response()->json([
                'data' => $loanReturn,
            ], 201);
        } catch (BusinessRuleException $exception) {
            return $this->conflict($exception);
        }
    }
}
