<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany, HasOne};
class Loan extends Model {
    protected $fillable = ['plan_id', 'engineer_id', 'plan_code_snapshot', 'plan_title_snapshot', 'category_name_snapshot', 'loaned_at', 'due_at'];
    protected function casts(): array { return ['loaned_at'=>'immutable_datetime', 'due_at'=>'immutable_datetime']; }
    public function plan(): BelongsTo { return $this->belongsTo(Plan::class); }
public function engineer(): BelongsTo { return $this->belongsTo(Engineer::class); }
public function loanReturn(): HasOne { return $this->hasOne(LoanReturn::class); }
}
