<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['database.default' => 'sqlite']);
    }

    public function test_guest_can_register_and_receive_token(): void
    {
        $payload = [
            'name' => 'New User',
            'username' => 'newuser',
            'email' => 'newuser@example.com',
            'password' => 'secret1',
            'password_confirmation' => 'secret1',
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.username', 'newuser')
            ->assertJsonPath('user.email', 'newuser@example.com')
            ->assertJsonPath('user.role', 'customer')
            ->assertJsonStructure(['access_token', 'token_type']);

        $this->assertDatabaseHas('users', [
            'username' => 'newuser',
            'email' => 'newuser@example.com',
            'role' => 'customer',
        ]);
    }

    public function test_registration_fails_when_username_or_email_is_taken(): void
    {
        DB::table('users')->insert([
            'name' => 'Existing',
            'username' => 'dupuser',
            'email' => 'dup@example.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
        ]);

        $response = $this->postJson('/api/register', [
            'username' => 'dupuser',
            'email' => 'dup@example.com',
            'password' => 'secret1',
            'password_confirmation' => 'secret1',
        ]);

        $response->assertStatus(422);
    }

    public function test_registration_fails_with_invalid_payload(): void
    {
        $response = $this->postJson('/api/register', [
            'username' => '',
            'email' => 'not-an-email',
            'password' => '123',
            'password_confirmation' => '456',
        ]);

        $response->assertStatus(422);
    }
}

