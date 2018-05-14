<?php

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run()
    {
        DB::table('roles')->delete();
        DB::table('permissions')->delete();
        DB::table('role_has_permissions')->delete();
        // Reset cached roles and permissions
        app()['cache']->forget('spatie.permission.cache');

        // create permissions
        Permission::create(['name' => 'admin bun']);
        Permission::create(['name' => 'admin delete tweet']);
        Permission::create(['name' => 'user delete tweet']);
        Permission::create(['name' => 'user add tweet']);

        // create roles and assign existing permissions
        $role = Role::create(['name' => 'admin']);
        $role->givePermissionTo(['admin bun','admin delete tweet']);

        $role = Role::create(['name' => 'user']);
        $role->givePermissionTo(['user delete tweet', 'user add tweet']);
    }
}
