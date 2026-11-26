<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuestLogoutTest extends TestCase
{
    use RefreshDatabase;

public function test_guest_cannot_logout(): void
{
    $this->postJson('/api/v1/auth/logout')
        ->assertUnauthorized();
}
}