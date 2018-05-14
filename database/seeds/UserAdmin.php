<?php

use App\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserAdmin extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Model::unguard();



        DB::table('users')->delete();

        $users = array(
            ['name' => 'Ryan Chenkie1', 'email' => 'ryanchenkie@gmail.com', 'password' => Hash::make('secret')],
        );

        // Loop through each user above and create the record for them in the database
        foreach ($users as $user)
        {
            $newUser = User::create($user);
         //   $newUser->assignRole('user');
        //    $newUser->givePermissionTo( 'admin bun', 'admin delete tweet');
            $newUser->assignRole('admin');
        }

        Model::reguard();
    }
}
