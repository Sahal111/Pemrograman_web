<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_proyek' => 'sometimes|required|string|max:100',
            'client' => 'sometimes|required|string|max:100',
            'deskripsi' => 'nullable|string',
            'status' => 'nullable|in:planning,ongoing,done',
            'priority' => 'nullable|in:low,medium,high',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'member_ids' => 'nullable|array',
            'member_ids.*' => 'integer|exists:users,id',
        ];
    }
}