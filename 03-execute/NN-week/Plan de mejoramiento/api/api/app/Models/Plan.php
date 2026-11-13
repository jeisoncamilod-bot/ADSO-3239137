<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany, HasOne};
class Plan extends Model {
    protected $fillable = ['code', 'title', 'description', 'category_id', 'total_units', 'available_units', 'is_active'];
    protected function casts(): array { return ['is_active'=>'boolean', 'total_units'=>'integer', 'available_units'=>'integer']; }
    public function category(): BelongsTo { return $this->belongsTo(Category::class); }
public function loans(): HasMany { return $this->hasMany(Loan::class); }
}
