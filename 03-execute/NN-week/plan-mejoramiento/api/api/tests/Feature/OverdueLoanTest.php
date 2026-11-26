<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Engineer;
use App\Models\Loan;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OverdueLoanTest extends TestCase
{
    use RefreshDatabase;

    public function test_engineer_with_overdue_loan_cannot_borrow_another_plan(): void
    {
        // Authenticate an administrator.
        $user = User::factory()->create();
        $user->role = User::ROLE_ADMIN;
        $user->save();

        $this->actingAs($user, 'sanctum');

        // Create a category.
        $category = Category::query()->create([
            'slug' => 'structural',
            'name' => 'Estructurales',
        ]);

        // Create an active engineer.
        $engineer = Engineer::query()->create([
            'employee_code' => 'ENG-200',
            'full_name' => 'Overdue Test Engineer',
            'is_active' => true,
        ]);

        // Create the plan associated with the overdue loan.
        $oldPlan = Plan::query()->create([
            'code' => 'EST-200',
            'title' => 'Previous Structural Plan',
            'category_id' => $category->id,
            'total_units' => 1,
            'available_units' => 0,
            'is_active' => true,
        ]);

        // Create an overdue loan without a return.
        Loan::query()->create([
            'plan_id' => $oldPlan->id,
            'engineer_id' => $engineer->id,
            'plan_code_snapshot' => $oldPlan->code,
            'plan_title_snapshot' => $oldPlan->title,
            'category_name_snapshot' => $category->name,
            'loaned_at' => now()->subDays(10),
            'due_at' => now()->subDays(4),
        ]);

        // Create a different plan with available inventory.
        $newPlan = Plan::query()->create([
            'code' => 'EST-201',
            'title' => 'New Structural Plan',
            'category_id' => $category->id,
            'total_units' => 1,
            'available_units' => 1,
            'is_active' => true,
        ]);

        // An overdue engineer must not receive another loan.
        $this->postJson('/api/v1/loans', [
            'plan_id' => $newPlan->id,
            'engineer_id' => $engineer->id,
        ])->assertStatus(409);

        // Rejected requests must not change inventory.
        $this->assertSame(
            1,
            $newPlan->fresh()->available_units
        );

        // The rejected request must not create a new loan.
        $this->assertDatabaseCount('loans', 1);
    }
}
