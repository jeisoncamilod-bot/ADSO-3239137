<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\BusinessRuleException;
use App\Http\Controllers\Controller;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

abstract class ApiController extends Controller
{
    /**
     * Get pagination parameters from the request.
     */
    protected function page(Request $request): array
    {
        $validated = $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        return [
            'page' => (int) ($validated['page'] ?? 1),
            'per_page' => (int) ($validated['per_page'] ?? 15),
        ];
    }

    /**
     * Return a paginated collection.
     */
    protected function collection(
        Builder $query,
        Request $request
    ): JsonResponse {
        $pagination = $this->page($request);

        $results = $query->paginate(
            $pagination['per_page'],
            ['*'],
            'page',
            $pagination['page']
        );

        return $this->paginatedResponse($results);
    }

    /**
     * Build a consistent pagination response.
     */
    protected function paginatedResponse(
        LengthAwarePaginator $paginator
    ): JsonResponse {
        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * Return a business rule conflict.
     */
    protected function conflict(
        BusinessRuleException $exception
    ): JsonResponse {
        return response()->json([
            'error' => [
                'code' => $exception->errorCode,
                'message' => $exception->getMessage(),
                'details' => (object) [],
            ],
        ], 409);
    }
}
