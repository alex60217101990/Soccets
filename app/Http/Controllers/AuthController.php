<?php

namespace App\Http\Controllers;

//use Illuminate\Auth\Access\Gate;
use App\admin_message;
use App\Events\NewMessage;
use App\Message;
use Illuminate\Mail\Events\MessageSent;
use Illuminate\Support\Facades\App;
use JWTAuth;
use Mockery\Exception;
use Psy\Util\Json;
use Pusher\Laravel\Facades\Pusher;
use Pusher\Pusher as Push;
use Pusher\Laravel\PusherManager;
use Tymon\JWTAuth\Exceptions\JWTException;
use App\User;
/*For roles and permission used.*/
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

use Gate;
use Illuminate\Support\Facades\Hash;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;

class AuthController extends Controller
{

    protected $roles;
    /**
     * Create a new AuthController instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('jwt.auth', ['except' => ['login']]);
    }

    /**
     * Get a JWT token via given credentials.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');
        try {
            if ($token = $this->guard()->attempt($credentials)) {
                if($this->guard()->user()->hasRole('user')||$this->guard()->user()->hasRole('admin')) {
                    // if no errors are encountered we can return a JWT
                    Pusher::trigger('my-channel', 'auth-event',
                        ['user'=>User::find($this->guard()->id())->name, 'type'=>'login']);
                    return response()->json(compact('token'));
                }
                else
                    return response()->json(['error' => 'you have no rights.'], 401);
            }else{
                return response()->json(['error' => 'invalid_credentials'], 401);
            }
        }
        catch (JWTException $e) {
            // something went wrong
            return response()->json(['error' => 'could_not_create_token'], 500);
        }
      //  return response()->json(['error' => 'Unauthorized'], 401);
    }

    /**
     * Get the authenticated User
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me()
    {
        return response()->json($this->guard()->user());
    }

    /**
     * Log the user out (Invalidate the token)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        Pusher::trigger('my-channel', 'auth-event',
           ['user'=>User::find($this->guard()->id())->name, 'type'=>'logout']);

        Pusher::trigger('logout-channel', 'private-logout-event',
            ['user'=>User::find($this->guard()->id())->id]);
        $this->guard()->logout();
        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
        return $this->respondWithToken($this->guard()->refresh());
    }

    /**
     * Get the token array structure.
     *
     * @param  string $token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => $this->guard()->factory()->getTTL() * 60
        ]);
    }

    /**
     * Get the guard to be used during authentication.
     *
     * @return \Illuminate\Contracts\Auth\Guard
     */
    public function guard()
    {
        return Auth::guard();
    }


    /**
     * Get all Users list.
     * @return Json
     * @param Request
     */
    public function getUsersList(Request $request){
        $user = new User;
        try {
         //   if(Gate::denies('getUsersInfo', $user))
            if(!$this->guard()->user()->hasRole('admin'))
              response()->json(['error' => 'You have no rights.'], 505);
            //$user = $this->guard()->user();
            $data = []; $counter = 1;
            foreach (User::all() as $User){
                $timeArr = [];
                $timeArr['user'] = $User;
                $timeArr['permissions'] = $User->getAllPermissions();
                $data[$counter++] = $timeArr;
            }
            return response()->json(['users' => $data]);
        }catch (\Exception $exception){
            return response()->json(['error_text' => $exception], 507);
        }
    }

    /**
     * Method for update user roles list.
     * @param Request $request
     * @return Json
     */
    public function backupUserRoles(Request $request){
        try{
            $data = []; $counter = 0;
            $user = User::where('id',$request->user_id)->first();
            foreach (json_decode($request->roles_list) as $role_user) {
                //$role = Role::findByName($role_user->name);
                $present = $user->hasRole($role_user->name);
                if(!$present) {
                    Role::create(['name' => $role_user->name]);
                    $user->assignRole($role_user->name);
                    array_push($data, $role_user->name);
                    $counter++;
                }
            }
            if($counter>0)
                return response()->json(['result'=>true]);
            return response()->json(['result'=>false]);
            /*['data'=>$request->roles_list[0]['name']]*/
        }catch (\Exception $exception){
            return response()->json(['error'=>$exception->getMessage()],502);
        }
    }


    public function connect(Request $request){
        try{
            if(($this->guard()->user()->hasRole('user') || $this->guard()->user()->hasRole('admin'))&&
                (!$this->guard()->user()->hasPermissionTo('Bun'))) {
                $res = json_decode($request->user, true);
                $user = User::where('email', '=', $res['email'])->first();

                if (!empty($user)) {
                    $new_message = message::create(['user_id' => $user->id, 'body_massage' => $request->message]);
                    $new_message->save();
                    $data = ['id' => $new_message->id, 'user_nickname' => $user->name, 'body_massage' => $new_message->body_massage,
                        'color' => $user->color, 'created_at' => $new_message->created_at];
                    Pusher::trigger('my-channel', 'my-event', $data);

                    if (message::all()->count() >= 20) {
                        $result = message::all()->sortBy('id')
                            ->first();
                        $result->delete();
                        //   Pusher::trigger('my-channel', 'delete-event', $data);
                    }
                }
                return response()->json(['result'=>$user]);
            }else{
                return response()->json(['result'=>'failed']);
            }
          //  broadcast(new NewMessage('fbngb', 'fbngbng'))->toOthers();
        }catch (Exception $exception){
            return response()->json(['result'=>'error']);
        }
    }

    public function getAllMessages(Request $request){
        try{
            $list = message::all()->sortByDesc('id')->take(10);
            $nickNames = $list->map(function ($element){
                return $element->user->name;
            });
            $colors = $list->map(function ($element){
                return $element->user->color;
            });
            return response()->json(['user_nickname'=>$nickNames,'data'=>$list, 'color'=>$colors/*,
                'onlineIndicate'=>$online_indicate*/]);
        }catch (Exception $exception){
            return response()->json(['error'=>$exception->getMessage()]);
        }
    }


    public function delete(Request $request){
        try {
            if (message::all()->count() >= 30) {
                $result = message::all()->sortBy('id')
                    ->take(30);
                foreach ($result as $item)
                    $item->delete();
            }
            return response()->json(['result' => message::all()->count()]);
        }catch (Exception $exception){
            return response()->json(['error'=>$exception->getMessage()]);
        }
    }

    public function deleteOne(Request $request){
        try{
            if(!empty($request->id)){
                message::where('id','=',$request->id)
                    ->first()
                    ->delete();
                Pusher::trigger('my-channel', 'delete-event', ['id'=>$request->id]);
                return response()->json(['result' => 'success']);
            }else{
                return response()->json(['result' => 'data was empty']);
            }
        }catch (Exception $exception){
            return response()->json(['error'=>$exception->getMessage()]);
        }
    }

    protected $pusher;
    public function PusherAuth(Request $request, PusherManager $pusher){
        try {
            if ($this->guard()->check()) {

                $this->pusher = $pusher;
             //   $cahnnelData = json_encode(['user_id' => uniqid('', true)]);
                $e = $this->pusher->socket_auth($request->channel_name, $request->socket_id/*, $cahnnelData*/);

                $fp = fopen("C:\\counter.txt", "w"); // Открываем файл в режиме записи
                $mytext = '' . $e; // Исходная строка
                $test = fwrite($fp, $mytext); // Запись в файл
                fclose($fp); //Закрытие файла

                return $e;
            }else{
                return response()->setStatusCode(403)->isForbidden();
            }
        }catch (Exception $exception) {
            return response()->json(["auth" => $this->guard()->check(),
                'error' => $exception->getMessage(),
                'code' => $exception->getCode()]);
        }
    }

//    public function authVideo(Request $request, PusherManager $pusher){
//        try {
//            if ($this->guard()->check()) {
//
//                $this->pusher = $pusher;
////                $cahnnelData = json_encode(['user_id' => uniqid('', true),
////                    'info'=>User::where('id','=',$this->guard()->user()->getAuthIdentifier())->first()->name]);
//                $e = $this->pusher->presence_auth($request->channel_name, $request->socket_id,
//                    uniqid('', true), ['name'=>$this->guard()->user()->getAuthIdentifierName()]);
//                return $e;
//            }else{
//                return response()->setStatusCode(403)->isForbidden();
//            }
//        }catch (Exception $exception) {
//            return response()->json(["auth" => $this->guard()->check(),
//                'error' => $exception->getMessage(),
//                'code' => $exception->getCode()]);
//        }
//    }
    public function authVideo(Request $request, PusherManager $pusher){
        try {
            if ($this->guard()->check()) {
                $this->pusher = $pusher;
                $e = $this->pusher->presence_auth($request->channel_name, $request->socket_id,
                    User::where('id','=',$this->guard()->id())->first()->email, ['user' => $this->guard()->user()]);
                return $e;
            }else{
                return response()->setStatusCode(403)->isForbidden();
            }
        }catch (Exception $exception) {
            return response()->json(["auth" => $this->guard()->check(),
                'error' => $exception->getMessage(),
                'code' => $exception->getCode()]);
        }
    }

    public function onlineIndicate(Request $request){
        $online_indicate = []; $users = [];
        $roles = []; $mails = []; $create=[];
        $was_bun = [];
        foreach (User::all() as $user){
            $users[]=$user->name;
            $online_indicate[]=$user->isOnline();
            $roles[]=$user->hasRole('admin')?'admin':'user';
            $mails[]=$user->email;
            $create[]=$user->created_at;
            $was_bun[]=$user->hasPermissionTo('Bun');
        }
        return response()->json(['users'=>$users,'indicates'=>$online_indicate,
            'roles'=>$roles, 'emails'=>$mails, 'created'=>$create, 'was_bun'=>$was_bun]);
    }


    public function getPermissions(Request $request){
        try{
            if($this->guard()->user()->hasRole('user') || $this->guard()->user()->hasRole('admin')) {
                // Все разрешения, применяемые к пользователю (унаследованные и прямые)
                //$user->getAllPermissions ();
                $permissionsList = [];
                foreach ($this->guard()->user()->getAllPermissions() as $permission)
                    array_push($permissionsList, $permission->name);
                return response()->json($permissionsList);
            }
            else{
                return response()->json(['message' => 'You have no rights.']);
            }
        }catch (\Exception $exception){
            return response()->json(['error' => $exception->getMessage()], 520);
        }
    }

    public function deleteUser(Request $request){
        try{
            if($this->guard()->user()->hasRole('admin')){
                if(!empty($request->data)){
                   $us = User::where('email','=',$request->data)
                        ->first();
                    foreach (message::where('user_id','=',$us->id)->get() as $message){
                        Pusher::trigger('my-channel', 'delete-event', ['id'=>$message->id]);
                        $message->delete();
                    }
                   // Pusher::trigger('my-channel', 'delete-user', ['email'=>$request->data]);
                    $us->delete();
                    return response()->json(['result' => 'success']);
                }else{
                    return response()->json(['result' => 'data was empty']);
                }
            }else
                return response()->json(['result' => 'You have no rights.']);
        }catch (Exception $exception){
            return response()->json(['error' => $exception->getMessage()], 500);
        }
    }

    public function addUserBun(Request $request){
        try{
            if($this->guard()->user()->hasRole('admin')){
                if(!empty($request->user)){
                    $user = User::where('email','=',$request->user)->first();
                   /* try {
                        Permission::create(['name' => 'Bun']);
                    }catch (Exception $exception){};*/
                    $user->givePermissionTo(['Bun']);
                    Pusher::trigger('my-channel', 'bun-user-event', ['email'=>$request->user]);
                    return response()->json(['result' => 'success']);
                }else
                    return response()->json(['result' => 'data was empty']);
            }else{
                return response()->json(['result' => 'You have no rights.']);
            }
        }catch (Exception $exception){
            return response()->json(['error' => $exception->getMessage()]);
        }
    }

    public function cancelUserBun(Request $request){
        try{
            if($this->guard()->user()->hasRole('admin')){
                if(!empty($request->user)){
                    $user = User::where('email','=',$request->user)->first();
                    $user->revokePermissionTo('Bun');
                    Pusher::trigger('my-channel', 'bun-close-user-event', ['email'=>$request->user]);
                    return response()->json(['result' => 'success']);
                }else
                    return response()->json(['result' => 'data was empty']);
            }else{
                return response()->json(['result' => 'You have no rights.']);
            }
        }catch (Exception $exception){
            return response()->json(['error' => $exception->getMessage()], 500);
        }
    }

    /**
     * Method add admin message for user.
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function adminMessage(Request $request){
        try{
            if($this->guard()->user()->hasRole('admin')){
                if((!empty($request->user)) && (!empty($request->message)) &&
                    (!empty($request->admin))){
                    $user = User::where('email','=',$request->user)->first();
                    $admin = User::where('email','=',$request->admin)->first();
                    $mess = admin_message::create(['user_id'=>$user->id,
                        'admin_id' => $admin->id, 'body_massage'=>$request->message]);
                    Pusher::trigger('my-channel', 'add-admin-message-event',
                        ['email' => $request->user,'message' => $mess]);
                    return response()->json(['result' => 'success'],200);
                } else
                    return response()->json(['result' => 'data was empty'],200);
            } else
                return response()->json(['result' => 'You have no rights.'],200);
        }catch (Exception $exception){
            return response()->json(['error' => $exception->getMessage()],500);
        }
    }

    public function getAdminMessages(Request $request){
        try{
            if($this->guard()->user()->hasRole('user') || $this->guard()->user()->hasRole('admin')) {
                if(!empty($request->email)){
                    $user = User::where('email','=',$request->email)->first();
                    $message_obj=[];
                    foreach ($user->adminMessages as $message){
                        $message_obj[]=['id'=>$message->id, 'body_massage' => $message->body_massage,
                            'created_at'=>$message->created_at];
                    }
                    //Pusher::trigger('my-channel', 'bun-close-user-event', ['email'=>$request->user]);
                    return response()->json($message_obj);
                }else
                    return response()->json(['result' => 'data was empty'],200);
            }else
                return response()->json(['error' => 'You have no rights.'],500);
        }catch (Exception $exception){
            return response()->json(['error' => $exception->getMessage()],500);
        }
    }

    public function deleteAdminMessage(Request $request){
        try{
            if($this->guard()->user()->hasRole('user')){
                if(!empty($request->id)){
                    admin_message::where('id','=',$request->id)
                        ->first()
                        ->delete();
                    return response()->json(['result' => 'success'],200);
                }else{
                    return response()->json(['result' => 'data was empty']);
                }
            }else
                return response()->json(['result' => 'You have no rights.']);
        }catch (Exception $exception){
            return response()->json(['error' => $exception->getMessage()], 500);
        }
    }

}
