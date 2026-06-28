<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama_proyek' => $this->nama_proyek,
            'client' => $this->client,
            'deskripsi' => $this->deskripsi,
            'status' => $this->status,
            'priority' => $this->priority,
            'timeline' => [
                'start_date' => $this->start_date,
                'end_date' => $this->end_date,
            ],
            'progress' => $this->progress,
            'creator' => $this->creator ? new UserResource($this->creator) : null,
            'members' => UserResource::collection($this->members),
            'tasks' => TaskResource::collection($this->tasks),
            'attachments' => $this->attachments->map(function ($a) {
                return [
                    'id' => $a->id,
                    'file_name' => $a->file_name,
                    'file_path' => $a->file_path,
                    'uploaded_by' => $a->uploaded_by,
                    'created_at' => $a->created_at,
                ];
            }),
        ];
    }
}