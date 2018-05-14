<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', 'AngularController@serve');
Route::post('/post', 'AngularController@post');
Route::get('/login', 'AngularController@serve')->name('login');
Route::get('/other', 'AngularController@serve');
Route::post('/auth/register', 'AngularController@newUser');
Route::post('/resource/path', 'AngularController@getIcon');
Route::get('/admin', 'AngularController@serve');
Route::get('/adminPanel/{id}', 'AngularController@serve');
Route::get('/video_chat', 'AngularController@serve');



/**
 * Authenticate.
 */
Route::group(['prefix' => 'auth', 'middleware' => ['web']], function() {
    Route::post('api/register', 'TokenAuthController@register');
    Route::post('api/authenticate', 'TokenAuthController@authenticate');
    Route::get('api/authenticate/user', 'TokenAuthController@getAuthenticatedUser');


    Route::post('data', 'AuthController@getData');
    Route::post('login', 'AuthController@login');
    Route::get('logout', 'AuthController@logout');
    Route::post('refresh', 'AuthController@refresh');
    Route::get('me', 'AuthController@me');

});

/**
 * Content regulations.
 */
Route::group(['prefix' => 'content', 'middleware' => ['web']], function() {
    Route::post('getUsers', 'AuthController@getUsersList');
    Route::post('getMessages', 'AuthController@getAllMessages');
    Route::post('deleteCity', 'AuthController@deleteCityAction');
    Route::post('soccet', 'AuthController@connect');
    Route::delete('delete', 'AuthController@delete');
    Route::post('deleteOne', 'AuthController@deleteOne');
    Route::post('onlineIndicate', 'AuthController@onlineIndicate');
    Route::post('getPermissions', 'AuthController@getPermissions');
    Route::delete('deleteUser', 'AuthController@deleteUser');
    Route::post('addUserBun', 'AuthController@addUserBun');
    Route::post('cancelUserBun', 'AuthController@cancelUserBun');
    Route::post('adminMessage', 'AuthController@adminMessage');
    Route::post('getAdminMessages', 'AuthController@getAdminMessages');
    Route::delete('deleteAdminMessage', 'AuthController@deleteAdminMessage');

    /*!!!!!!!!!!!!*/
    Route::post('/auth', 'AuthController@PusherAuth');
    Route::post('/authVideo', 'AuthController@authVideo');
});

/**
 * Admin panel.
 */
Route::group(['prefix' => 'admin', 'middleware' => ['web']], function() {
    /*Methods Admin API.*/
    Route::post('backupUserRoles', 'AuthController@backupUserRoles');
});

