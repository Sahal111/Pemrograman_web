<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentRequest;
use App\Models\Task;

class CommentController extends Controller
{
    public function index(Task $task)
    {
        $comments = $task->comments()->with('user')->latest()->get();

        return response()->json([
            'data' => $comments->map(function ($c) {
                return [
                    'id' => $c->id,
                    'komentar' => $c->komentar,
                    'user' => [
                        'id' => $c->user->id,
                        'username' => $c->user->username,
                    ],
                    'created_at' => $c->created_at,
                ];
            }),
        ]);
    }

    public function store(StoreCommentRequest $request, Task $task)
    {
        $comment = $task->comments()->create([
            'user_id' => $request->user()->id,
            'komentar' => $request->komentar,
        ]);

        $comment->load('user');

        return response()->json([
            'data' => [
                'id' => $comment->id,
                'komentar' => $comment->komentar,
                'user' => [
                    'id' => $comment->user->id,
                    'username' => $comment->user->username,
                ],
                'created_at' => $comment->created_at,
            ],
        ], 201);
    }

    public function destroy(\App\Models\Comment $comment)
    {
        $comment->delete();

        return response()->json(['message' => 'Komentar berhasil dihapus.']);
    }
}