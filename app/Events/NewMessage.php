<?php

namespace App\Events;

use App\Message;
use App\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class NewMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Only (!) Public members will be serialized to JSON and sent to Pusher
     **/
    public $message;
    public $user;

    /**
     * Create a new event instance.
     * @params Message, User
     * @return void
     */
    public function __construct($message, $user_name)
    {
        $this->message = $message;
        $this->user = $user_name;
    }

    /**
     * Get the channels the event should be broadcast on.
     *
     *  @return Channel|array
     */
    public function broadcastOn()
    {
        return ['chat'];
    }

}
