<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InviteCode extends Model
{
    const UPDATED_AT = null;

    protected $fillable = [
        'code',
        'role',
        'is_used',
        'created_by',
        'used_by',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'used_by');
    }
}