<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectDetailResource;
use App\Http\Resources\ProjectResource;
use App\Models\Project;

class ProjectController extends Controller
{
    // Halaman List
   public function index()
{
    $projects = Project::with(['tasks.assignee', 'members'])->get();

    return ProjectResource::collection($projects);
}

    // Halaman Detail
    public function show(Project $project)
    {
        $project->load(['creator', 'members', 'tasks.assignee', 'attachments']);

        return new ProjectDetailResource($project);
    }

    public function store(StoreProjectRequest $request)
    {
        $project = Project::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
        ]);

        if ($request->filled('member_ids')) {
            $project->members()->sync($request->member_ids);
        }

        return new ProjectDetailResource($project->load(['creator', 'members', 'tasks', 'attachments']));
    }

    public function update(UpdateProjectRequest $request, Project $project)
    {
        $project->update($request->validated());

        if ($request->filled('member_ids')) {
            $project->members()->sync($request->member_ids);
        }

        return new ProjectDetailResource($project->load(['creator', 'members', 'tasks', 'attachments']));
    }

    public function destroy(Project $project)
    {
        $project->delete();

        return response()->json(['message' => 'Project berhasil dihapus.']);
    }
}