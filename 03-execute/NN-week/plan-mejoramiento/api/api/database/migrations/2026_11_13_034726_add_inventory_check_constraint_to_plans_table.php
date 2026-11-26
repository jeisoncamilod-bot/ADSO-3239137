<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement(
            'ALTER TABLE plans
             ADD CONSTRAINT plans_inventory_check
             CHECK (
                 total_units >= 0
                 AND available_units >= 0
                 AND available_units <= total_units
             )'
        );
    }

    public function down(): void
    {
        DB::statement(
            'ALTER TABLE plans
             DROP CONSTRAINT IF EXISTS plans_inventory_check'
        );
    }
};