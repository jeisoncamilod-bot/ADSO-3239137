<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuestEngineerUpdateTest extends TestCase
{
    use RefreshDatabase;

public function test_guest_cannot_update_engineer(): void
{
    $this->patchJson('/api/v1/engineers/999999', [
        'full_name' => 'Unauthorized Update',
    ])->assertUnauthorized();
}
}