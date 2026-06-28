<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\AttachmentController;
use App\Models\User;
use App\Http\Controllers\Api\InviteCodeController;
use App\Http\Controllers\Api\UserApprovalController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/me/photo', [AuthController::class, 'uploadPhoto']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::apiResource('projects', ProjectController::class);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/users', function () {
        return response()->json([
            'data' => User::where('status', 'active')
                ->select('id', 'username', 'email', 'role', 'job_title', 'department', 'bio', 'phone', 'timezone', 'photo')
                ->get(),
        ]);
    });

    // Semua role bisa lihat
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/projects/{project}', [ProjectController::class, 'show']);

    // Cuma PM yang bisa create/update/delete project
    Route::middleware('role:pm')->group(function () {
        Route::post('/projects', [ProjectController::class, 'store']);
        Route::put('/projects/{project}', [ProjectController::class, 'update']);
        Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);
        Route::post('/projects/{project}/tasks', [TaskController::class, 'store']);
        Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);

        // Baru:
        Route::get('/invite-codes', [InviteCodeController::class, 'index']);
        Route::post('/invite-codes', [InviteCodeController::class, 'store']);

        Route::get('/users/pending', [UserApprovalController::class, 'pending']);
        Route::post('/users/{user}/approve', [UserApprovalController::class, 'approve']);
        Route::delete('/users/{user}/reject', [UserApprovalController::class, 'reject']);
    });

    // Task: lihat untuk semua, create/edit/delete khusus PM
    Route::get('/projects/{project}/tasks', [TaskController::class, 'index']);
    Route::get('/tasks', [TaskController::class, 'all']);
    Route::get('/tasks/{task}', [TaskController::class, 'show']);
    Route::get('/tasks/{task}', [TaskController::class, 'show']);

    Route::middleware('role:pm')->group(function () {
        Route::post('/projects/{project}/tasks', [TaskController::class, 'store']);
        Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
    });

    // Update status task: PM, Developer, QA semua bisa hit endpoint ini,
    // tapi validasi detail dilakukan di TaskController (lihat langkah 4)
    Route::put('/tasks/{task}', [TaskController::class, 'update']);

    // Comment & Attachment: semua role bisa
    Route::get('/tasks/{task}/comments', [CommentController::class, 'index']);
    Route::post('/tasks/{task}/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

    Route::get('/projects/{project}/attachments', [AttachmentController::class, 'index']);
    Route::post('/projects/{project}/attachments', [AttachmentController::class, 'store']);
    Route::delete('/attachments/{attachment}', [AttachmentController::class, 'destroy']);
});