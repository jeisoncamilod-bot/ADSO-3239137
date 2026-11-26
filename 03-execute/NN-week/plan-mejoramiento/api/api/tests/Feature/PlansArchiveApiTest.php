<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Engineer;
use App\Models\Plan;
use App\Models\User;
use Database\Seeders\CategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlansArchiveApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create an administrator for protected API requests.
        $user = User::factory()->create();

        // Assign the administrator role explicitly.
        $user->role = User::ROLE_ADMIN;
        $user->save();

        // Authenticate the administrator using Sanctum.
        $this->actingAs($user, 'sanctum');
    }

    public function test_categories_can_be_seeded(): void
    {
        $this->seed(CategorySeeder::class);

        $this->getJson('/api/v1/categories')
            ->assertOk()
            ->assertJsonCount(5, 'data');
    }

    public function test_plan_can_be_created(): void
    {
        $category = Category::query()->create([
            'slug' => 'structural',
            'name' => 'Estructurales',
        ]);

        $this->postJson('/api/v1/plans', [
            'code' => 'EST-001',
            'title' => 'Main Structure',
            'category_id' => $category->id,
            'total_units' => 2,
        ])
            ->assertCreated()
            ->assertJsonPath('data.available_units', 2);
    }

    public function test_loan_and_return_update_inventory(): void
    {
        $category = Category::query()->create([
            'slug' => 'structural',
            'name' => 'Estructurales',
        ]);

        $plan = Plan::query()->create([
            'code' => 'EST-001',
            'title' => 'Main Structure',
            'category_id' => $category->id,
            'total_units' => 1,
            'available_units' => 1,
            'is_active' => true,
        ]);

        $engineer = Engineer::query()->create([
            'employee_code' => 'ENG-1',
            'full_name' => 'Test Engineer',
            'is_active' => true,
        ]);

        // Create a loan.
        $loanId = $this->postJson('/api/v1/loans', [
            'plan_id' => $plan->id,
            'engineer_id' => $engineer->id,
        ])
            ->assertCreated()
            ->json('data.id');

        // Inventory decreases after creating a loan.
        $this->assertSame(
            0,
            $plan->fresh()->available_units
        );

        // Return the borrowed plan.
        $this->postJson(
            "/api/v1/loans/{$loanId}/returns",
            []
        )->assertCreated();

        // Inventory increases after returning the plan.
        $this->assertSame(
            1,
            $plan->fresh()->available_units
        );

        // Duplicate returns must be rejected.
        $this->postJson(
            "/api/v1/loans/{$loanId}/returns",
            []
        )->assertStatus(409);
    }
}
