<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Engineer;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InactivePlanLoanTest extends TestCase
{
    use RefreshDatabase;

    public function test_inactive_plan_cannot_be_loaned(): void
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
            'code' => 'INA-001',
            'title' => 'Inactive Plan',
            'category_id' => $category->id,
            'total_units' => 1,
            'available_units' => 1,
            'is_active' => false,
        ]);

        $engineer = Engineer::query()->create([
            'employee_code' => 'ENG-INA',
            'full_name' => 'Inactive Plan Engineer',
            'is_active' => true,
        ]);

        $this->postJson('/api/v1/loans', [
            'plan_id' => $plan->id,
            'engineer_id' => $engineer->id,
        ])->assertStatus(409);

        $this->assertDatabaseCount('loans', 0);
        $this->assertSame(1, $plan->fresh()->available_units);
    }
}