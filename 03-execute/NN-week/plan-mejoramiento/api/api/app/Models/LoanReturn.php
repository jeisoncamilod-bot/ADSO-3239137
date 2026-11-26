<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany, HasOne};
class LoanReturn extends Model {
    protected $table = 'loan_returns';
    protected $fillable = ['loan_id', 'returned_at'];
    protected function casts(): array { return ['returned_at'=>'immutable_datetime']; }
    public function loan(): BelongsTo { return $this->belongsTo(Loan::class); }
}
