<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up(): void { Schema::create('plans', function (Blueprint $table) { $table->id(); $table->string('code',60)->unique(); $table->string('title',200); $table->text('description')->nullable(); $table->foreignId('category_id')->constrained()->restrictOnDelete(); $table->unsignedInteger('total_units'); $table->unsignedInteger('available_units'); $table->boolean('is_active')->default(true); $table->timestamps(); }); }
 public function down(): void { Schema::dropIfExists('plans'); }
};
