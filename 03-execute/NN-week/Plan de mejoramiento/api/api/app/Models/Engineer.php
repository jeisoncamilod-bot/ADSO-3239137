<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany, HasOne};
class Engineer extends Model {
    protected $fillable = ['employee_code', 'full_name', 'email', 'is_active'];
    protected function casts(): array { return ['is_active'=>'boolean']; }
    public function loans(): HasMany { return $this->hasMany(Loan::class); }
}
