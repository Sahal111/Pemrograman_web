<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama_proyek' => $this->nama_proyek,
            'client' => $this->client,
            'status' => $this->status,
            'priority' => $this->priority,
            'deadline' => $this->end_date,
            'progress' => $this->progress,
            'creator' => $this->creator ? [
                'id' => $this->creator->id,
                'username' => $this->creator->username,
            ] : null,
            'members' => $this->members->map(fn($m) => [
                'id' => $m->id,
                'username' => $m->username,
                'role' => $m->role,
            ]),
            'tasks' => $this->tasks->map(fn($t) => [
                'id' => $t->id,
                'nama_tugas' => $t->nama_tugas,
                'deskripsi' => $t->deskripsi,
                'status' => $t->status,
                'priority' => $t->priority,
                'due_date' => $t->due_date,
                'created_at' => $t->created_at,
                'assignee' => $t->assignee ? [
                    'id' => $t->assignee->id,
                    'username' => $t->assignee->username,
                ] : null,
            ]),
        ];
    }
}