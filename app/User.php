<?php

namespace App;

use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Cache;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Foundation\Auth\User as Authenticatable;
use App\users_role;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements JWTSubject
{
    use HasRoles;
    use Notifiable;

  //  protected $guard_name = 'web';
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password', 'color'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    /**
     * Get collection of user roles.
     * @param void
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
  /*  public function roles()
    {
        return $this->hasMany('App\users_role');
    }*/


    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }


    public function messages()
    {
        return $this->hasMany('App\message');
    }

    public function adminMessages()
    {
        return $this->hasMany('App\admin_message');
    }


    public function isOnline()
    {
        return Cache::has('user-is-online-' . $this->id);
    }

}
