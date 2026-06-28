<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'required|email|max:100|unique:users,email',
            'password' => 'required|string|min:6',
            'invite_code' => 'required|string',
        ]);

        $invite = \App\Models\InviteCode::where('code', $request->invite_code)
            ->where('is_used', false)
            ->first();

        if (!$invite) {
            return response()->json([
                'message' => 'Kode invite tidak valid atau sudah digunakan.',
            ], 422);
        }



        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $invite->role,
            'status' => 'pending',
        ]);

        $invite->update([
            'is_used' => true,
            'used_by' => $user->id,
        ]);

        return response()->json([
            'message' => 'Registrasi berhasil. Akun Anda menunggu approval dari Project Manager.',
            'user' => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        if ($user->status === 'pending') {
            return response()->json([
                'message' => 'Akun Anda masih menunggu approval dari Project Manager.',
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Berhasil logout.',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'data' => $request->user()
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'username' => 'sometimes|required|string|max:50|unique:users,username,' . $user->id,
            'email' => 'sometimes|required|email|max:100|unique:users,email,' . $user->id,
            'job_title' => 'nullable|string|max:100',
            'department' => 'nullable|string|max:100',
            'bio' => 'nullable|string|max:1000',
            'phone' => 'nullable|string|max:30',
            'timezone' => 'nullable|string|max:100',
        ]);

        $user->update($request->only([
            'username',
            'email',
            'job_title',
            'department',
            'bio',
            'phone',
            'timezone',
        ]));

        return response()->json(['data' => $user]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:8',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Password saat ini salah.',
            ], 422);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        return response()->json(['message' => 'Password berhasil diubah.']);
    }

    public function uploadPhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|max:5120', // max 5MB
        ]);

        $user = $request->user();

        // Hapus foto lama kalau ada
        if ($user->photo) {
            \Storage::disk('public')->delete($user->photo);
        }

        $path = $request->file('photo')->store('profile-photos', 'public');

        $user->update(['photo' => $path]);

        return response()->json(['data' => $user]);
    }
    
}