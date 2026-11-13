<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Engineer;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DuplicateReturnTest extends TestCase
{
    use RefreshDatabase;

    public function test_duplicate_return_is_rejected_without_changing_inventory(): void
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
            'code' => 'DUP-001',
            'title' => 'Duplicate Return Plan',
            'category_id' => $category->id,
            'total_units' => 1,
            'available_units' => 1,
            'is_active' => true,
        ]);

        $engineer = Engineer::query()->create([
            'employee_code' => 'ENG-DUP',
            'full_name' => 'Duplicate Return Engineer',
            'is_active' => true,
        ]);

        $loanId = $this->postJson('/api/v1/loans', [
            'plan_id' => $plan->id,
            'engineer_id' => $engineer->id,
        ])->assertCreated()->json('data.id');

        $this->postJson("/api/v1/loans/{$loanId}/returns", [])
            ->assertCreated();

        $this->postJson("/api/v1/loans/{$loanId}/returns", [])
            ->assertStatus(409);

        $this->assertSame(1, $plan->fresh()->available_units);
        $this->assertDatabaseCount('loan_returns', 1);
    }
}