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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('image_url');
            $table->text('original_link'); // Original product URL (will be wrapped with affiliate deep link)
            $table->json('weather_tags'); // JSON array: ['rain', 'sunny', 'cloudy', etc.]
            $table->integer('min_temp')->nullable(); // Minimum temperature for product relevance
            $table->integer('max_temp')->nullable(); // Maximum temperature for product relevance
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Indexes for query optimization
            $table->index('is_active');
            $table->index(['min_temp', 'max_temp']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
