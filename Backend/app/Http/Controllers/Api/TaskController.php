<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    // List semua task dalam 1 project
    public function index(Project $project)
    {
        $tasks = $project->tasks()->with('assignee')->get();

        return TaskResource::collection($tasks);
    }

    // Tambah task baru ke project
    public function store(StoreTaskRequest $request, Project $project)
    {
        $task = $project->tasks()->create($request->validated());

        return new TaskResource($task->load('assignee'));
    }

    // Detail 1 task
    public function show(Task $task)
    {
        return new TaskResource($task->load(['assignee', 'comments.user', 'attachments']));
    }

    // Update task (termasuk ubah status: todo/inprogress/review/done)
    public function update(UpdateTaskRequest $request, Task $task)
{
    $user = $request->user();
    $newStatus = $request->input('status');

    if ($user->role === 'developer') {
        // Developer hanya boleh mengubah task yang ditugaskan ke dirinya
        if ($task->assigned_to !== $user->id) {
            return response()->json([
                'message' => 'Anda hanya bisa mengubah task yang ditugaskan kepada Anda.',
            ], 403);
        }

        // Developer tidak boleh langsung set status ke 'done' (harus lewat 'review' dulu, di-approve QA)
        if ($newStatus === 'done') {
            return response()->json([
                'message' => 'Developer tidak bisa menandai task selesai. Set status ke "review" untuk diperiksa QA.',
            ], 403);
        }
    }

    if ($user->role === 'qa') {
        // QA hanya boleh mengubah status dari 'review' menjadi 'done' (approve)
        $allowedTransition = $task->status === 'review' && $newStatus === 'done';

        if (!$allowedTransition) {
            return response()->json([
                'message' => 'QA hanya bisa menyetujui task yang berstatus "review" menjadi "done".',
            ], 403);
        }
    }

    // PM bebas mengubah apapun (tidak ada pembatasan tambahan)

    $task->update($request->validated());

    return new TaskResource($task->load('assignee'));
}

    // Hapus task
    public function destroy(Task $task)
    {
        $task->delete();

        return response()->json(['message' => 'Task berhasil dihapus.']);
    }
    public function all(Request $request)
{
    $tasks = Task::with(['project', 'assignee'])->get();

    return response()->json([
        'data' => $tasks->map(function ($t) {
            return [
                'id' => $t->id,
                'project_id' => $t->project_id,
                'project_name' => $t->project->nama_proyek,
                'nama_tugas' => $t->nama_tugas,
                'deskripsi' => $t->deskripsi,
                'status' => $t->status,
                'priority' => $t->priority,
                'due_date' => $t->due_date,
                'assignee' => $t->assignee ? [
                    'id' => $t->assignee->id,
                    'username' => $t->assignee->username,
                ] : null,
            ];
        }),
    ]);
}
}