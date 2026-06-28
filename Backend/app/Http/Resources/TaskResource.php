<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'nama_tugas' => $this->nama_tugas,
            'deskripsi' => $this->deskripsi,
            'status' => $this->status,
            'priority' => $this->priority,
            'start_date' => $this->start_date,
            'due_date' => $this->due_date,
            'created_at' => $this->created_at,
            'assignee' => $this->assignee ? [
                'id' => $this->assignee->id,
                'username' => $this->assignee->username,
            ] : null,
        ];
    }
}