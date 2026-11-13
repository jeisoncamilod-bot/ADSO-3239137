<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrivateReadAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_read_private_resources(): void
    {
        $routes = [
            '/api/v1/engineers',
            '/api/v1/engineers/999999',
            '/api/v1/loans',
            '/api/v1/loans/999999',
        ];

        foreach ($routes as $route) {
            $this->getJson($route)->assertUnauthorized();
        }
    }

    public function test_authenticated_users_can_read_private_collections(): void
    {
        $user = User::factory()->create();
        $user->role = User::ROLE_OPERATOR;
        $user->save();

        $this->actingAs($user, 'sanctum');

        $this->getJson('/api/v1/engineers')->assertOk();
        $this->getJson('/api/v1/loans')->assertOk();
    }

    public function test_authenticated_users_receive_not_found_for_missing_records(): void
    {
        $user = User::factory()->create();
        $user->role = User::ROLE_OPERATOR;
        $user->save();

        $this->actingAs($user, 'sanctum');

        $this->getJson('/api/v1/engineers/999999')->assertNotFound();
        $this->getJson('/api/v1/loans/999999')->assertNotFound();
    }
}