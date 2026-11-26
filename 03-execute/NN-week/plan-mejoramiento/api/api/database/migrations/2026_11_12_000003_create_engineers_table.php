<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up(): void { Schema::create('engineers', function (Blueprint $table) { $table->id(); $table->string('employee_code',60)->unique(); $table->string('full_name',180); $table->string('email',180)->nullable()->unique(); $table->boolean('is_active')->default(true); $table->timestamps(); }); }
 public function down(): void { Schema::dropIfExists('engineers'); }
};
