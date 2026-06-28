<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index()
    {
        $projects = Project::with(['tasks.assignee', 'members', 'creator'])->get();

        return ProjectResource::collection($projects);
    }
}