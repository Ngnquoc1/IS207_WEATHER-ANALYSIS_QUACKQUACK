<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Verify that the authenticated user has admin role.
     * Returns 403 Forbidden if user is not admin.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated and has admin role
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Admin privileges required.'
            ], 403);
        }
        
        return $next($request);
    }
}
