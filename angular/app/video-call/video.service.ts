import {EventEmitter, Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {AuthService} from "../auth.service";
import {UserOne} from "../pusher.service";
import {HttpClient} from "@angular/common/http";
declare var Pusher: any;

@Injectable()
export class VideoService {
    users: Observable<User[]>;
    private fetching: boolean=false;
    private _users: BehaviorSubject<User[]>;
    private dataStore: {
        users: User[]
    };
    public event$: EventEmitter<User>;
    protected pusher = new Pusher('XXXXXXXXXXXXXXXXXXXX', {
        cluster: 'eu',
        encrypted: true,
        authEndpoint: '/content/authVideo',
        auth: {
            headers: {
                Authorization: `Bearer ${this.auth.getToken()}`
            }
        }
    });
    protected Channel = this.pusher.subscribe('presence-video-calls');
    protected closeChannel = this.pusher.subscribe('logout-channel');
    get getChannel(){
        return this.closeChannel;
    }
    get ConnectChannel(){
        return this.Channel;
    }
  constructor(private auth: AuthService,
              private http: HttpClient) {
      this.dataStore = { users: [] };
      this._users = <BehaviorSubject<User[]>>new BehaviorSubject([]);
      this.users = this._users.asObservable();
      this.event$ = new EventEmitter<User>();

      this.Channel.bind('pusher:subscription_succeeded', (members)=>{
          if (this.fetching) {
              return;
          } else {
              members.each(member => {
                  if(member.info['user']['email']!==JSON.parse(localStorage.getItem('user_data'))['email']) {
                      this.dataStore.users.push({
                          id: member.info['user']['id'],
                          name: member.info['user']['name'],
                          email: member.info['user']['email'],
                          created_at: new Date(member.info['user']['created_at']),
                          online: true
                      });
                      this.fetching = true;
                      this._users.next(Object.assign({}, this.dataStore).users);
                  }
              }, error => console.log('Could not load users.'));
              console.log(this.dataStore.users);
          }
      });

      this.Channel.bind('pusher:member_added', member => {
          let newUser: User = {id: member.info['user']['id'],
              name: member.info['user']['name'], email: member.info['user']['email'],
              created_at: new Date(member.info['user']['created_at']), online: true
          };
          this.dataStore.users.forEach((item, index) => {
              if(item.id===member.info['user']['id']){
                  return;
              }
          });
          this.dataStore.users.push(newUser);
          console.log('was add success.');
          this._users.next(Object.assign({}, this.dataStore).users);
      });

      this.Channel.bind("pusher:member_removed", member => {
          //console.log('REMOVE');
          this.dataStore.users.forEach((item, index) => {
              if(item.id===member.info['user']['id']){
                  this.dataStore.users.splice(index,1);
                  this._users.next(Object.assign({}, this.dataStore).users);
                  this.event$.emit(member);
                  console.log('was remove success.');
              }
          });
      });

      this.closeChannel.bind('private-logout-event', user=>{
          this.dataStore.users.forEach((item, index) => {
              if(item.id===user['user']){
                  this.dataStore.users.splice(index,1);
                  this._users.next(Object.assign({}, this.dataStore).users);
                  console.log('was remove success.');
              }
          });
      });

  }


}

export interface User {
    id ?: number;
    name ?: string;
    email ?: string;
    created_at ?: Date;
    online ?: boolean;
}
