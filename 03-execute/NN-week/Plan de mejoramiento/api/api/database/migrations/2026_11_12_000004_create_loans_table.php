<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up(): void { Schema::create('loans', function (Blueprint $table) { $table->id(); $table->foreignId('plan_id')->constrained()->restrictOnDelete(); $table->foreignId('engineer_id')->constrained()->restrictOnDelete(); $table->string('plan_code_snapshot',60); $table->string('plan_title_snapshot',200); $table->string('category_name_snapshot',120); $table->timestampTz('loaned_at'); $table->timestampTz('due_at'); $table->timestamps(); $table->index(['engineer_id','due_at']); $table->index(['plan_id','loaned_at']); }); }
 public function down(): void { Schema::dropIfExists('loans'); }
};
