<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attachment;
use App\Models\Project;
use Illuminate\Http\Request;

class AttachmentController extends Controller
{
    public function index(Project $project)
    {
        $attachments = $project->attachments()->with('uploader')->get();

        return response()->json([
            'data' => $attachments->map(fn($a) => [
                'id' => $a->id,
                'file_name' => $a->file_name,
                'url' => asset('storage/' . $a->file_path),
                'uploaded_by' => $a->uploader?->username,
                'created_at' => $a->created_at,
            ]),
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $request->validate([
            'file' => 'required|file|max:10240',
            'task_id' => 'nullable|integer|exists:tasks,id',
        ]);

        $file = $request->file('file');
        $path = $file->store('attachments', 'public');

        $attachment = Attachment::create([
            'project_id' => $project->id,
            'task_id' => $request->task_id,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'uploaded_by' => $request->user()->id,
        ]);

        return response()->json([
            'data' => [
                'id' => $attachment->id,
                'file_name' => $attachment->file_name,
                'url' => asset('storage/' . $attachment->file_path),
            ],
        ], 201);
    }

    public function destroy(Attachment $attachment)
    {
        \Storage::disk('public')->delete($attachment->file_path);
        $attachment->delete();

        return response()->json(['message' => 'Lampiran berhasil dihapus.']);
    }
}