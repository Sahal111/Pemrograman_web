<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'nama_proyek',
        'client',
        'deskripsi',
        'status',
        'priority',
        'start_date',
        'end_date',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'project_members', 'project_id', 'user_id');
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function attachments()
    {
        return $this->hasMany(Attachment::class);
    }

    public function getProgressAttribute()
    {
        $total = $this->tasks()->count();
        if ($total === 0)
            return 0;

        $done = $this->tasks()->where('status', 'done')->count();
        return round(($done / $total) * 100);
    }
}