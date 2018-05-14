<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class admin_message extends Model
{
    public $table = 'admin_messages';
    protected $fillable = ['id', 'user_id','admin_id','body_massage','created_at'];
    public function user()
    {
        return $this->belongsTo('App\User');
    }
}
