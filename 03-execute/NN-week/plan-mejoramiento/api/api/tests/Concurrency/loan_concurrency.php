<?php

require __DIR__ . '/../../vendor/autoload.php';

$app = require __DIR__ . '/../../bootstrap/app.php';

$app->make(
    Illuminate\Contracts\Console\Kernel::class
)->bootstrap();

use App\Models\Category;
use App\Models\Engineer;
use App\Models\Loan;
use App\Models\Plan;
use App\Services\LoanService;
use Illuminate\Support\Facades\DB;

$action = $argv[1] ?? '';

if (DB::connection()->getDriverName() !== 'pgsql') {
    fwrite(STDERR, "ERROR: PostgreSQL is required.\n");
    exit(1);
}

if (DB::connection()->getDatabaseName() !== 'plans_archive_test') {
    fwrite(STDERR, "ERROR: Unsafe database selected.\n");
    exit(1);
}

if ($action === 'setup') {
    $category = Category::query()->create([
        'slug' => 'concurrency-test-' . uniqid(),
        'name' => 'Concurrency Test',
    ]);

    $plan = Plan::query()->create([
        'code' => 'CON-' . strtoupper(substr(uniqid(), -8)),
        'title' => 'Concurrent Loan Test',
        'category_id' => $category->id,
        'total_units' => 1,
        'available_units' => 1,
        'is_active' => true,
    ]);

    $engineers = [];

    for ($i = 1; $i <= 2; $i++) {
        $engineer = Engineer::query()->create([
            'employee_code' => 'CON-' . $i . '-' . uniqid(),
            'full_name' => 'Concurrent Engineer ' . $i,
            'is_active' => true,
        ]);

        $engineers[] = $engineer->id;
    }

    echo json_encode([
        'plan_id' => $plan->id,
        'engineer_ids' => $engineers,
    ]);

    exit(0);
}

if ($action === 'loan') {
    $engineerId = (int) ($argv[2] ?? 0);
    $planId = (int) ($argv[3] ?? 0);

    try {
        $loan = app(LoanService::class)->create($engineerId, $planId);

        echo json_encode([
            'result' => 'success',
            'loan_id' => $loan->id,
        ]);
    } catch (Throwable $exception) {
        echo json_encode([
            'result' => 'rejected',
            'exception' => get_class($exception),
            'message' => $exception->getMessage(),
        ]);
    }

    exit(0);
}

if ($action === 'verify') {
    $planId = (int) ($argv[2] ?? 0);

    $plan = Plan::query()->findOrFail($planId);

    echo json_encode([
        'available_units' => $plan->available_units,
        'total_units' => $plan->total_units,
        'loan_count' => Loan::query()
            ->where('plan_id', $planId)
            ->count(),
    ]);

    exit(0);
}

fwrite(STDERR, "Unknown action.\n");
exit(1);