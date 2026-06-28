<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    const UPDATED_AT = null;
    
    protected $fillable = [
        'username',
        'email',
        'password',
        'role',
        'job_title',
        'department',
        'bio',
        'phone',
        'timezone',
        'photo',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relasi
    public function projectsCreated()
    {
        return $this->hasMany(Project::class, 'created_by');
    }

    public function tasksAssigned()
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    public function projects()
    {
        return $this->belongsToMany(Project::class, 'project_members', 'user_id', 'project_id');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}