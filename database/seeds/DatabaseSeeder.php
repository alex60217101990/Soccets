<?php

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;
use App\User;

class DatabaseSeeder extends Seeder
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
            ['name' => 'Ryan Chenkie', 'email' => 'ryanchenkie@gmail.com', 'password' => Hash::make('secret')],
            ['name' => 'Chris Sevilleja', 'email' => 'chris@scotch.io', 'password' => Hash::make('secret')],
            ['name' => 'Holly Lloyd', 'email' => 'holly@scotch.io', 'password' => Hash::make('secret')],
            ['name' => 'Adnan Kukic', 'email' => 'adnan@scotch.io', 'password' => Hash::make('secret')],
            ['name' => 'Alex Ershov', 'email' => 'alex602@gmail.com', 'password' => Hash::make('macedon')],
            ['name' => 'Alex602', 'email' => 'macedon602@rambler.ru', 'password' => Hash::make('Chpodonok')],
        );

        // Loop through each user above and create the record for them in the database
        foreach ($users as $user)
        {
            $newUser = User::create($user);
            $newUser->assignRole('base user');
            $newUser->givePermissionTo( "delete cities", "update cities");
        }

        Model::reguard();
    }
}
