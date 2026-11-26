<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OperatorPlanDeleteTest extends TestCase
{
    use RefreshDatabase;

    public function test_operator_cannot_delete_plan(): void
    {
        $user = User::factory()->create();
        $user->role = User::ROLE_OPERATOR;
        $user->save();

        $this->actingAs($user, 'sanctum');

        $category = Category::query()->create([
            'slug' => 'structural',
            'name' => 'Estructurales',
        ]);

        $plan = Plan::query()->create([
            'code' => 'SEC-001',
            'title' => 'Protected Plan',
            'category_id' => $category->id,
            'total_units' => 2,
            'available_units' => 2,
            'is_active' => true,
        ]);

        $this->deleteJson("/api/v1/plans/{$plan->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('plans', [
            'id' => $plan->id,
            'is_active' => true,
        ]);
    }
}