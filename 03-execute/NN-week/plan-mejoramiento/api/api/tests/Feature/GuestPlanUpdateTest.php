<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuestPlanUpdateTest extends TestCase
{
    use RefreshDatabase;

public function test_guest_cannot_update_plan(): void
{
    $this->patchJson('/api/v1/plans/999999', [
        'title' => 'Unauthorized Update',
    ])->assertUnauthorized();
}
}