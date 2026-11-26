<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Engineer;
use App\Models\Loan;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoanDueDateTest extends TestCase
{
    use RefreshDatabase;

    public function test_loan_due_date_is_six_days_after_creation(): void
    {
        $user = User::factory()->create();
        $user->role = User::ROLE_ADMIN;
        $user->save();

        $this->actingAs($user, 'sanctum');

        $category = Category::query()->create([
            'slug' => 'structural',
            'name' => 'Estructurales',
        ]);

        $plan = Plan::query()->create([
            'code' => 'DUE-001',
            'title' => 'Due Date Plan',
            'category_id' => $category->id,
            'total_units' => 1,
            'available_units' => 1,
            'is_active' => true,
        ]);

        $engineer = Engineer::query()->create([
            'employee_code' => 'ENG-DUE',
            'full_name' => 'Due Date Engineer',
            'is_active' => true,
        ]);

        $loanId = $this->postJson('/api/v1/loans', [
            'plan_id' => $plan->id,
            'engineer_id' => $engineer->id,
        ])->assertCreated()->json('data.id');

        $loan = Loan::query()->findOrFail($loanId);

        $this->assertSame(
            6,
            (int) $loan->loaned_at->diffInDays($loan->due_at)
        );
    }
}