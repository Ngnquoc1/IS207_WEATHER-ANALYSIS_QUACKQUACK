<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DefaultUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin User
        User::updateOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Administrator',
                'email' => 'admin@weather.com',
                'password' => Hash::make('123456'),
                'role' => 'admin',
            ]
        );

        // Create Customer User
        User::updateOrCreate(
            ['username' => 'customer'],
            [
                'name' => 'Customer',
                'email' => 'customer@weather.com',
                'password' => Hash::make('123'),
                'role' => 'customer',
            ]
        );

        $this->command->info('Default users created successfully!');
        $this->command->info('Admin: username=admin, password=123456');
        $this->command->info('Customer: username=customer, password=123');
    }
}
