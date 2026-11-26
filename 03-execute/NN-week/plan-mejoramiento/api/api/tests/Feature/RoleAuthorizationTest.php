<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_operator_cannot_create_plan(): void
    {
        $user = User::factory()->create();
        $user->role = User::ROLE_OPERATOR;
        $user->save();

        $this->actingAs($user, 'sanctum');

        $this->postJson('/api/v1/plans', [])
            ->assertForbidden();
    }

    public function test_admin_can_create_plan(): void
    {
        $user = User::factory()->create();
        $user->role = User::ROLE_ADMIN;
        $user->save();

        $this->actingAs($user, 'sanctum');

        $category = Category::query()->create([
            'slug' => 'structural',
            'name' => 'Estructurales',
        ]);

        $this->postJson('/api/v1/plans', [
            'code' => 'EST-002',
            'title' => 'Structural Plan',
            'category_id' => $category->id,
            'total_units' => 3,
        ])->assertCreated();
    }

    public function test_operator_can_create_engineer(): void
    {
        $user = User::factory()->create();
        $user->role = User::ROLE_OPERATOR;
        $user->save();

        $this->actingAs($user, 'sanctum');

        $this->postJson('/api/v1/engineers', [
            'employee_code' => 'ENG-002',
            'full_name' => 'Test Engineer',
        ])->assertCreated();
    }

    public function test_guest_cannot_create_engineer(): void
    {
        $this->postJson('/api/v1/engineers', [])
            ->assertUnauthorized();
    }
}
