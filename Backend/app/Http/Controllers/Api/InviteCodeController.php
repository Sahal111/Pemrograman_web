<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InviteCode;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InviteCodeController extends Controller
{
    public function index(Request $request)
    {
        $codes = InviteCode::with(['creator', 'user'])->latest()->get();

        return response()->json([
            'data' => $codes->map(fn($c) => [
                'id' => $c->id,
                'code' => $c->code,
                'role' => $c->role,
                'is_used' => $c->is_used,
                'used_by' => $c->user?->username,
                'created_at' => $c->created_at,
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'role' => 'required|in:pm,developer,qa',
        ]);

        $code = strtoupper(Str::random(8));

        $invite = InviteCode::create([
            'code' => $code,
            'role' => $request->role,
            'created_by' => $request->user()->id,
        ]);

        return response()->json(['data' => $invite], 201);
    }
}