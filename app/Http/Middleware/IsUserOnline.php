<?php

namespace App\Http\Middleware;

use Carbon\Carbon;
use Closure;
use Illuminate\Support\Facades\Cache;
use JWTAuth;
//use Cache;

class IsUserOnline
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        // If user logged then create cache data on the 5 minutes.
        if (auth()->check()) {
            $user = auth()->user();
            $expiresAt = Carbon::now()->addMinutes(1);
            Cache::put('user-is-online-' . $user->id, true, $expiresAt);
        }
        return $next($request);
    }
}
