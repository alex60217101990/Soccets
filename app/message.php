<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class message extends Model
{
    public $table = 'messages';
    protected $fillable = ['id', 'user_id','body_massage'];
    public function user()
    {
        return $this->belongsTo('App\User');
    }
}
