<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuestReturnTest extends TestCase
{
    use RefreshDatabase;

public function test_guest_cannot_return_loan(): void
{
    $this->postJson('/api/v1/loans/999999/returns', [])
        ->assertUnauthorized();
}
}