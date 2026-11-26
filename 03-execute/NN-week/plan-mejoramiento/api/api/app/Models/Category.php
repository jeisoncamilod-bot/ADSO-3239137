<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany, HasOne};
class Category extends Model {
    protected $fillable = ['slug', 'name'];

    public function plans(): HasMany { return $this->hasMany(Plan::class); }
}
