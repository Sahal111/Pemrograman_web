<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserApprovalController extends Controller
{
    public function pending()
    {
        $users = User::where('status', 'pending')
            ->select('id', 'username', 'email', 'role', 'created_at')
            ->get();

        return response()->json(['data' => $users]);
    }

    public function approve(User $user)
    {
        $user->update(['status' => 'active']);

        return response()->json(['message' => 'User berhasil di-approve.']);
    }

    public function reject(User $user)
    {
        $user->delete();

        return response()->json(['message' => 'User ditolak dan dihapus.']);
    }
}