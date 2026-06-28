<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('job_title', 100)->nullable()->after('role');
            $table->string('department', 100)->nullable()->after('job_title');
            $table->text('bio')->nullable()->after('department');
            $table->string('phone', 20)->nullable()->after('bio');
            $table->string('timezone', 100)->nullable()->after('phone');
            $table->string('photo')->nullable()->after('timezone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['job_title', 'department', 'bio', 'phone', 'timezone', 'photo']);
        });
    }
};
