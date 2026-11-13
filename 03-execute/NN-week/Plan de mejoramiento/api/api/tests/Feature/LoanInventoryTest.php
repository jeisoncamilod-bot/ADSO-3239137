<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Engineer;
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

        $engineer = Engineer::query()->create([
            'employee_code' => 'ENG-100',
            'full_name' => 'Test Engineer',
            'is_active' => true,
        ]);

        $payload = [
            'plan_id' => $plan->id,
            'engineer_id' => $engineer->id,
        ];

        // The first loan consumes the available unit.
        $this->postJson('/api/v1/loans', $payload)
            ->assertCreated();

        $this->assertSame(
            0,
            $plan->fresh()->available_units
        );

        // A second loan must be rejected.
        $this->postJson('/api/v1/loans', $payload)
            ->assertStatus(409);

        // Inventory must never become negative.
        $this->assertSame(
            0,
            $plan->fresh()->available_units
        );
    }
}
