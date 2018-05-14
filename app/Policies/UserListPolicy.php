<?php

namespace App\Policies;

use App\User;
use App\citie;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserListPolicy
{
    use HandlesAuthorization;

    /**
     * Create a new policy instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    private function rools(User &$user, $field)
    {
        if(!is_array($field)) {
            foreach ($user->roles as $role) {
                if ($role->role_name === $field || $role->role_name === 'Admin')
                    return $role->role_name;
            }
            return false;
        }else{
            foreach ($user->roles as $role){
                foreach ($field as $item){
                    if($role->role_name === $item)
                        return $role->role_name;
                }
            }return false;
        }
    }

    public function getUsersInfo(User &$user){
        return $this->rools($user, 'Admin');
    }

    public function getCitiesInfo(User $user){
        return $this->rools($user, 'baseUser');
    }

    public function deleteCity(User &$user){
        return $this->rools($user, ['Moderator','Admin']);
    }
}
