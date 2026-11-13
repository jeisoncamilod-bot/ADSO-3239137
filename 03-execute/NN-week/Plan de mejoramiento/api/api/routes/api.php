
<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\EngineerController;
use App\Http\Controllers\Api\LoanController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\ReportController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    // Public authentication endpoint.
    Route::post('auth/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1');

    // Public read-only endpoints.
    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('plans', [PlanController::class, 'index']);
    Route::get('plans/{plan}', [PlanController::class, 'show']);
    Route::get('engineers', [EngineerController::class, 'index'])->middleware('auth:sanctum');
    Route::get('engineers/{engineer}', [EngineerController::class, 'show'])->middleware('auth:sanctum');
    Route::get('loans', [LoanController::class, 'index'])->middleware('auth:sanctum');
    Route::get('loans/{loan}', [LoanController::class, 'show'])->middleware('auth:sanctum');
    Route::get('reports/most-requested-plans', [
        ReportController::class,
        'mostRequested',
    ]);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::post('auth/logout', [AuthController::class, 'logout']);

        // Administrator-only operations.
        Route::middleware('role:admin')->group(function (): void {
            Route::post('plans', [PlanController::class, 'store']);
            Route::patch('plans/{plan}', [PlanController::class, 'update']);
            Route::delete('plans/{plan}', [PlanController::class, 'destroy']);
        });

        // Administrator and operator operations.
        Route::middleware('role:admin,operator')->group(function (): void {
            Route::post('engineers', [EngineerController::class, 'store']);
            Route::patch('engineers/{engineer}', [
                EngineerController::class,
                'update',
            ]);

            Route::post('loans', [LoanController::class, 'store']);
            Route::post('loans/{loan}/returns', [
                LoanController::class,
                'returnLoan',
            ]);
        });
    });
});
