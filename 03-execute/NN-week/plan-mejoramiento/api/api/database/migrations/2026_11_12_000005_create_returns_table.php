<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up(): void { Schema::create('loan_returns', function (Blueprint $table) { $table->id(); $table->foreignId('loan_id')->unique()->constrained('loans')->restrictOnDelete(); $table->timestampTz('returned_at'); $table->timestamps(); }); }
 public function down(): void { Schema::dropIfExists('loan_returns'); }
};
