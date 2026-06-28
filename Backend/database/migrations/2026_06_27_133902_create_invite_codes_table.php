<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invite_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->enum('role', ['pm', 'developer', 'qa']);
            $table->boolean('is_used')->default(false);
            $table->integer('created_by')->nullable();
            $table->integer('used_by')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('used_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invite_codes');
    }
};