
<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Engineer;
use App\Models\Loan;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoanInventoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_plan_cannot_be_loaned_without_available_units(): void
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
            'code' => 'EST-100',
            'title' => 'Structural Plan',
            'category_id' => $category->id,
            'total_units' => 1,
            'available_units' => 1,
            'is_active' => true,
        ]);

        $firstEngineer = Engineer::query()->create([
            'employee_code' => 'ENG-100',
            'full_name' => 'First Test Engineer',
            'is_active' => true,
        ]);

        $secondEngineer = Engineer::query()->create([
            'employee_code' => 'ENG-101',
            'full_name' => 'Second Test Engineer',
            'is_active' => true,
        ]);

        // The first engineer receives the last available unit.
        $this->postJson('/api/v1/loans', [
            'plan_id' => $plan->id,
            'engineer_id' => $firstEngineer->id,
        ])->assertCreated();

        $this->assertSame(
            0,
            $plan->fresh()->available_units
        );

        // The second engineer must receive an HTTP conflict.
        $this->postJson('/api/v1/loans', [
            'plan_id' => $plan->id,
            'engineer_id' => $secondEngineer->id,
        ])->assertStatus(409);

        // Inventory must remain consistent.
        $this->assertSame(
            0,
            $plan->fresh()->available_units
        );

        $this->assertSame(
            1,
            $plan->fresh()->total_units
        );

        // Only one loan must exist for the requested plan.
        $this->assertSame(
            1,
            Loan::query()
                ->where('plan_id', $plan->id)
                ->count()
        );

        $this->assertDatabaseHas('loans', [
            'plan_id' => $plan->id,
            'engineer_id' => $firstEngineer->id,
        ]);

        $this->assertDatabaseMissing('loans', [
            'plan_id' => $plan->id,
            'engineer_id' => $secondEngineer->id,
        ]);
    }
}
