<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Engineer;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoanLimitTest extends TestCase
{
    use RefreshDatabase;

    public function test_engineer_cannot_have_more_than_three_active_loans(): void
    {
        $user = User::factory()->create();
        $user->role = User::ROLE_ADMIN;
        $user->save();

        $this->actingAs($user, 'sanctum');

        $category = Category::query()->create([
            'slug' => 'structural',
            'name' => 'Estructurales',
        ]);

        $engineer = Engineer::query()->create([
            'employee_code' => 'ENG-100',
            'full_name' => 'Test Engineer',
            'is_active' => true,
        ]);

        for ($i = 1; $i <= 4; $i++) {
            $plan = Plan::query()->create([
                'code' => 'EST-' . $i,
                'title' => 'Test Plan ' . $i,
                'category_id' => $category->id,
                'total_units' => 1,
                'available_units' => 1,
                'is_active' => true,
            ]);

            $response = $this->postJson('/api/v1/loans', [
                'plan_id' => $plan->id,
                'engineer_id' => $engineer->id,
            ]);

            if ($i <= 3) {
                $response->assertCreated();
            } else {
                $response->assertStatus(409);
            }
        }
    }
}
