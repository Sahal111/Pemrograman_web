<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_tugas' => 'sometimes|required|string|max:150',
            'deskripsi' => 'nullable|string',
            'assigned_to' => 'nullable|integer|exists:users,id',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|in:todo,inprogress,review,done',
            'priority' => 'nullable|in:low,medium,high',
        ];
    }
}