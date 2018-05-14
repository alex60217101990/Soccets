<?php

$factory->define(App\User::class, function (Faker\Generator $faker) {
    static $password;

 /*   $role = $role = Role::findByName('admin');
    $permission = Permission::create(['name' => 'bun users']);
    $permission1 = Permission::create(['name' => 'delete message']);*/
    return [
        'name' => $faker->name,
        'email' => $faker->unique()->safeEmail,
        'password' => $password ?: $password = bcrypt('secret'),
        'remember_token' => str_random(10),
    ];
});

